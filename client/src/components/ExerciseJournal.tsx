import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExerciseEntries, deleteExerciseEntry } from "@/lib/api";
import { ExerciseEntry } from "../types";
import { Loader2, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ExerciseJournalProps {
  date: Date;
  onChangeDate: (date: Date) => void;
}

export function ExerciseJournal({ date, onChangeDate }: ExerciseJournalProps) {
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Format the date for the API
  const formattedDate = format(date, "yyyy-MM-dd");
  
  // Fetch exercise entries for the selected date
  const { data: exerciseEntries, isLoading, error } = useQuery({
    queryKey: ['/api/exercise-entries', formattedDate],
    queryFn: () => getExerciseEntries(formattedDate),
  });
  
  // Set up the delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteExerciseEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exercise-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calories/summary'] });
      toast({
        title: "Exercise deleted",
        description: "Exercise entry has been removed from your journal",
      });
      setEntryToDelete(null);
    },
    onError: (error) => {
      console.error("Error deleting exercise entry:", error);
      toast({
        title: "Error",
        description: "Failed to delete exercise entry",
        variant: "destructive",
      });
    },
  });
  
  // Format duration in minutes to a more readable format
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }
    
    return `${hours} hr ${remainingMinutes} min`;
  };
  
  // Format intensity to capitalize first letter
  const formatIntensity = (intensity: string) => {
    return intensity.charAt(0).toUpperCase() + intensity.slice(1);
  };
  
  // Calculate the total calories burned for the day
  const totalCaloriesBurned = exerciseEntries?.reduce((sum, entry) => sum + entry.caloriesBurned, 0) || 0;
  
  // Calculate the total workout time for the day
  const totalWorkoutTime = exerciseEntries?.reduce((sum, entry) => sum + entry.duration, 0) || 0;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Exercise Journal</h3>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              {format(date, "MMMM d, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && onChangeDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Summary Card */}
      {!isLoading && exerciseEntries && exerciseEntries.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Workout Time</p>
                <p className="text-xl font-bold">{formatDuration(totalWorkoutTime)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Calories Burned</p>
                <p className="text-xl font-bold">{totalCaloriesBurned} kcal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center p-8 text-destructive">
          <p>Failed to load exercise entries. Please try again.</p>
        </div>
      ) : exerciseEntries && exerciseEntries.length > 0 ? (
        <div className="space-y-3">
          {exerciseEntries.map((entry: ExerciseEntry) => (
            <Card key={entry.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{entry.exercise?.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {formatIntensity(entry.intensity)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDuration(entry.duration)} • {entry.caloriesBurned} kcal
                    </p>
                    {entry.notes && (
                      <p className="text-sm mt-2 text-muted-foreground">{entry.notes}</p>
                    )}
                  </div>
                  
                  <AlertDialog open={entryToDelete === entry.id} onOpenChange={(open) => !open && setEntryToDelete(null)}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setEntryToDelete(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Exercise Entry</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this exercise entry? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => deleteMutation.mutate(entry.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          <p>No exercises logged for this day.</p>
          <p className="text-sm">Use the "Log Exercise" button to add your workouts.</p>
        </div>
      )}
    </div>
  );
}