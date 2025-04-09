import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Edit as EditIcon, 
  Trash2 as TrashIcon,
  AlertCircle as AlertIcon,
  Loader2 as LoaderIcon
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { FoodEntry, MealType } from "../types";
import { apiRequest } from "@/lib/queryClient";
import { deleteFoodEntry } from "@/lib/api";

interface FoodJournalProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export function FoodJournal({ date, onDateChange }: FoodJournalProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Format date for API
  const formattedDate = format(date, "yyyy-MM-dd");
  
  // Fetch food entries for the selected date
  const { 
    data: entries = [], 
    isLoading,
    error 
  } = useQuery<FoodEntry[]>({
    queryKey: ['/api/food-entries', formattedDate],
    queryFn: async () => {
      try {
        console.log(`Fetching food entries for date: ${formattedDate}`);
        const res = await apiRequest({
          method: 'GET',
          url: `/api/food-entries?date=${formattedDate}`
        });
        if (typeof res.json === 'function') {
          return await res.json();
        }
        // If apiRequest already parsed the JSON
        return res;
      } catch (err) {
        console.error("Error fetching food entries:", err);
        throw err;
      }
    }
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteFoodEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/food-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/nutrition/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calories/summary'] });
      toast({
        title: "Deleted",
        description: "Food entry has been removed from your journal",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the food entry",
        variant: "destructive",
      });
    },
  });
  
  // Group entries by meal type
  const entriesByMeal: Record<MealType, FoodEntry[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };
  
  entries.forEach(entry => {
    const mealType = entry.mealType as MealType;
    if (mealType) {
      entriesByMeal[mealType].push(entry);
    }
  });
  
  // Calculate totals for each meal
  const mealTotals: Record<MealType, { calories: number; protein: number; carbs: number; fat: number }> = {
    breakfast: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    lunch: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    dinner: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    snack: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  };
  
  // Calculate daily totals
  const dailyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  Object.entries(entriesByMeal).forEach(([mealType, mealEntries]) => {
    mealEntries.forEach(entry => {
      mealTotals[mealType as MealType].calories += entry.calories;
      mealTotals[mealType as MealType].protein += entry.protein;
      mealTotals[mealType as MealType].carbs += entry.carbs;
      mealTotals[mealType as MealType].fat += entry.fat;
      
      dailyTotals.calories += entry.calories;
      dailyTotals.protein += entry.protein;
      dailyTotals.carbs += entry.carbs;
      dailyTotals.fat += entry.fat;
    });
  });
  
  const handleDeleteClick = (entryId: number) => {
    setSelectedEntryId(entryId);
    setDeleteConfirmOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedEntryId !== null) {
      deleteMutation.mutate(selectedEntryId);
      setDeleteConfirmOpen(false);
      setSelectedEntryId(null);
    }
  };
  
  // Format date for display
  const displayDate = format(date, "EEEE, MMMM d, yyyy");
  
  // Function to render meal section
  const renderMealSection = (mealType: MealType, title: string) => {
    const mealEntries = entriesByMeal[mealType];
    const totals = mealTotals[mealType];
    
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-lg">{title}</h3>
          <div className="text-sm text-muted-foreground">
            {totals.calories} kcal
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : mealEntries.length === 0 ? (
          <div className="text-center py-4 border border-dashed rounded-md text-muted-foreground">
            No entries for {title.toLowerCase()}
          </div>
        ) : (
          <div className="space-y-2">
            {mealEntries.map(entry => (
              <div key={entry.id} className="bg-accent/40 p-3 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-medium">{entry.food?.name || "Food"}</p>
                  <p className="text-sm text-muted-foreground">
                    {entry.servingSize} {entry.servingSizeUnit}
                    {entry.notes && ` • ${entry.notes}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-medium">{entry.calories} kcal</p>
                    <p className="text-xs text-muted-foreground">
                      P: {entry.protein}g • C: {entry.carbs}g • F: {entry.fat}g
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(entry.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Food Journal</CardTitle>
              <CardDescription>{displayDate}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDateChange(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  try {
                    const picker = document.getElementById('date-picker') as HTMLInputElement;
                    // Only call showPicker if it exists (for browser compatibility)
                    if (picker && typeof picker.showPicker === 'function') {
                      picker.showPicker();
                    } else {
                      // Fallback for browsers that don't support showPicker
                      picker?.click();
                    }
                  } catch (e) {
                    console.error("Could not show date picker:", e);
                  }
                }}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
              <input
                id="date-picker"
                type="date"
                className="sr-only"
                value={formattedDate}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  if (!isNaN(newDate.getTime())) {
                    onDateChange(newDate);
                  }
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex items-center justify-center p-4 text-red-500">
              <AlertIcon className="h-4 w-4 mr-2" />
              Error loading food entries
            </div>
          ) : (
            <>
              {/* Daily Summary */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Daily Totals</h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-primary/10 p-2 rounded-md text-center">
                    <div className="text-xs text-muted-foreground">Calories</div>
                    <div className="font-medium">{dailyTotals.calories}</div>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-md text-center">
                    <div className="text-xs text-muted-foreground">Protein</div>
                    <div className="font-medium">{dailyTotals.protein.toFixed(1)}g</div>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-md text-center">
                    <div className="text-xs text-muted-foreground">Carbs</div>
                    <div className="font-medium">{dailyTotals.carbs.toFixed(1)}g</div>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-md text-center">
                    <div className="text-xs text-muted-foreground">Fat</div>
                    <div className="font-medium">{dailyTotals.fat.toFixed(1)}g</div>
                  </div>
                </div>
              </div>
              
              {/* Render meal sections */}
              {renderMealSection("breakfast", "Breakfast")}
              {renderMealSection("lunch", "Lunch")}
              {renderMealSection("dinner", "Dinner")}
              {renderMealSection("snack", "Snacks")}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this food entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {deleteMutation.isPending ? (
                <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}