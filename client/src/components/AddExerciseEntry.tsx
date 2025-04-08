import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createExerciseEntry } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ExerciseData } from "../types";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, CalendarIcon } from "lucide-react";

// Exercise entry form schema
const ExerciseEntrySchema = z.object({
  date: z.date(),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  intensity: z.enum(["low", "medium", "high"]),
  notes: z.string().optional(),
});

type ExerciseEntryFormValues = z.infer<typeof ExerciseEntrySchema>;

interface AddExerciseEntryProps {
  exercise: ExerciseData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AddExerciseEntry({ exercise, isOpen, onClose }: AddExerciseEntryProps) {
  const [estimatedCalories, setEstimatedCalories] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize form with default values
  const form = useForm<ExerciseEntryFormValues>({
    resolver: zodResolver(ExerciseEntrySchema),
    defaultValues: {
      date: new Date(),
      duration: 30,
      intensity: "medium",
      notes: "",
    },
  });
  
  // Calculate estimated calories based on duration, intensity, and exercise type
  useEffect(() => {
    if (!exercise) return;
    
    const duration = form.watch("duration") || 0;
    const intensity = form.watch("intensity");
    const baseCaloriesPerMinute = exercise.caloriesBurnedPerMinute || 5;
    
    let intensityMultiplier = 1;
    switch (intensity) {
      case "low":
        intensityMultiplier = 0.8;
        break;
      case "medium":
        intensityMultiplier = 1;
        break;
      case "high":
        intensityMultiplier = 1.2;
        break;
      default:
        intensityMultiplier = 1;
    }
    
    const calculatedCalories = Math.round(baseCaloriesPerMinute * duration * intensityMultiplier);
    setEstimatedCalories(calculatedCalories);
  }, [exercise, form.watch("duration"), form.watch("intensity")]);
  
  // Reset form when exercise changes
  useEffect(() => {
    if (exercise) {
      form.reset({
        date: new Date(),
        duration: 30,
        intensity: "medium",
        notes: "",
      });
    }
  }, [exercise, form]);
  
  // Mutation for creating an exercise entry
  const createEntryMutation = useMutation({
    mutationFn: createExerciseEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exercise-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calories/summary'] });
      toast({
        title: "Exercise logged",
        description: "Your workout has been added to your journal",
      });
      onClose();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to log exercise: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: ExerciseEntryFormValues) => {
    if (!exercise) return;
    
    createEntryMutation.mutate({
      exerciseId: exercise.id,
      date: format(values.date, "yyyy-MM-dd"),
      duration: values.duration,
      intensity: values.intensity,
      caloriesBurned: estimatedCalories,
      notes: values.notes,
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {exercise ? `Log ${exercise.name}` : "Log Exercise"}
          </DialogTitle>
        </DialogHeader>
        
        {exercise ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="font-medium">{exercise.name}</p>
                <p className="text-sm text-muted-foreground">
                  {exercise.category} • ~{exercise.caloriesBurnedPerMinute} cal/min
                </p>
                {exercise.description && (
                  <p className="text-sm mt-2">{exercise.description}</p>
                )}
              </div>
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="intensity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intensity</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select intensity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Felt great, increased resistance"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="bg-muted/50 p-3 rounded-md flex justify-between items-center">
                <span className="text-sm">Estimated Calories Burned</span>
                <span className="font-medium">{estimatedCalories} kcal</span>
              </div>
              
              <DialogFooter className="pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createEntryMutation.isPending}
                >
                  {createEntryMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Log Exercise
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="text-center p-6">
            <p>No exercise selected.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}