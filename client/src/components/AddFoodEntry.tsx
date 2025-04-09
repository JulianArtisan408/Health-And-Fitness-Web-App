import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FoodData, MealType } from "../types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addFoodEntry, createFood } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Create a schema for the food entry form
const FoodEntrySchema = z.object({
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  servingSize: z.coerce.number().positive("Serving size must be positive"),
  servingSizeUnit: z.string().default("g"),
  date: z.string(),
  notes: z.string().optional(),
});

type FoodEntryFormValues = z.infer<typeof FoodEntrySchema>;

interface AddFoodEntryProps {
  food: FoodData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AddFoodEntry({ food, isOpen, onClose }: AddFoodEntryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Set up the form
  const form = useForm<FoodEntryFormValues>({
    resolver: zodResolver(FoodEntrySchema),
    defaultValues: {
      mealType: "breakfast",
      servingSize: food?.servingSize || 100,
      servingSizeUnit: food?.servingSizeUnit || "g",
      date: format(new Date(), "yyyy-MM-dd"),
      notes: "",
    },
  });
  
  // Set up the entry creation mutation
  const addEntryMutation = useMutation({
    mutationFn: (data: any) => addFoodEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/food-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/nutrition/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calories/summary'] });
      toast({
        title: "Food added",
        description: "Food has been added to your journal",
      });
      onClose();
      form.reset();
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error("Error adding food entry:", error);
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Failed to add food to your journal",
        variant: "destructive",
      });
    },
  });
  
  // Set up the food creation mutation
  const createFoodMutation = useMutation({
    mutationFn: (data: any) => createFood(data),
    onSuccess: (createdFood: any) => {
      // After creating the food, add the entry with the new food ID
      const entryData = {
        foodId: createdFood.id,
        mealType: form.getValues("mealType"),
        servingSize: form.getValues("servingSize"),
        servingSizeUnit: form.getValues("servingSizeUnit"),
        date: form.getValues("date"),
        notes: form.getValues("notes"),
        // Calculate nutrition based on serving size
        calories: Math.round((food!.calories * form.getValues("servingSize")) / (food!.servingSize || 100)),
        protein: +(food!.protein * form.getValues("servingSize") / (food!.servingSize || 100)).toFixed(1),
        carbs: +(food!.carbs * form.getValues("servingSize") / (food!.servingSize || 100)).toFixed(1),
        fat: +(food!.fat * form.getValues("servingSize") / (food!.servingSize || 100)).toFixed(1),
      };
      
      addEntryMutation.mutate(entryData);
    },
    onError: (error) => {
      console.error("Error creating food:", error);
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Failed to add food to the database",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: FoodEntryFormValues) => {
    if (!food) return;
    
    setIsSubmitting(true);
    
    // First, create the food in our database
    const foodData = {
      name: food.name,
      brand: food.brand,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      sugar: food.sugar,
      servingSize: food.servingSize || 100,
      servingSizeUnit: food.servingSizeUnit || "g",
      image: food.image,
      usdaFoodId: food.id, // Store the original USDA ID
      isUserCreated: false
    };
    
    createFoodMutation.mutate(foodData);
  };
  
  return (
    <Dialog open={isOpen && food !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Food Journal</DialogTitle>
          <DialogDescription>
            {food?.name}
            {food?.brand && ` by ${food.brand}`}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="mealType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select meal type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="servingSize"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Serving Size</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} min="0" step="0.1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="servingSizeUnit"
                render={({ field }) => (
                  <FormItem className="w-24">
                    <FormLabel>Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="oz">oz</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="cup">cup</SelectItem>
                        <SelectItem value="tbsp">tbsp</SelectItem>
                        <SelectItem value="serving">serving</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
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
                      placeholder="Add any notes about this food..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Add to Journal
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}