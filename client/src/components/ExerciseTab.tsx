import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { ExerciseSearch } from "./ExerciseSearch";
import { ExerciseJournal } from "./ExerciseJournal";
import { AddExerciseEntry } from "./AddExerciseEntry";
import { ExerciseData } from "../types";
import { useQuery } from "@tanstack/react-query";
import { getCaloriesSummary } from "@/lib/api";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ExerciseTab() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseData | null>(null);
  
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  
  // Fetch calorie summary for the day
  const { data: caloriesSummary } = useQuery({
    queryKey: ['/api/calories/summary', formattedDate],
    queryFn: () => getCaloriesSummary(formattedDate),
    initialData: { consumed: 0, burned: 0, net: 0 }
  });
  
  // Handle selecting an exercise from search
  const handleSelectExercise = (exercise: ExerciseData) => {
    setSelectedExercise(exercise);
    setIsSearchDialogOpen(false);
    setIsAddDialogOpen(true);
  };
  
  // Handle closing the add entry dialog
  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
    setSelectedExercise(null);
  };
  
  return (
    <div className="bg-background/80 backdrop-blur-md p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Exercise Tracking</h2>
          <p className="text-muted-foreground">Track your workouts and physical activities</p>
        </div>
        
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsSearchDialogOpen(true)}
        >
          <PlusIcon className="h-4 w-4" />
          <span>Log Exercise</span>
        </Button>
      </div>
      
      {/* Today's Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Today's Summary</CardTitle>
          <CardDescription>
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Calories Consumed</p>
              <p className="text-2xl font-bold">{caloriesSummary.consumed} kcal</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Calories Burned</p>
              <p className="text-2xl font-bold">{caloriesSummary.burned} kcal</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Net Calories</p>
              <p className="text-2xl font-bold">{caloriesSummary.net} kcal</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Exercise Journal */}
      <ExerciseJournal
        date={selectedDate}
        onChangeDate={setSelectedDate}
      />
      
      {/* Exercise Search Dialog */}
      <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Find Exercise</DialogTitle>
            <DialogDescription>
              Search for an exercise or create a custom one
            </DialogDescription>
          </DialogHeader>
          
          <ExerciseSearch onSelectExercise={handleSelectExercise} />
        </DialogContent>
      </Dialog>
      
      {/* Add Exercise Entry Dialog */}
      <AddExerciseEntry
        exercise={selectedExercise}
        isOpen={isAddDialogOpen}
        onClose={handleCloseAddDialog}
      />
    </div>
  );
}