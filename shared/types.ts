// Interface for food data structure
export interface FoodData {
  id: number;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  servingSize?: number;
  servingSizeUnit?: string;
  image?: string;
}

// Interface for food entry
export interface FoodEntry {
  id: number;
  userId: number;
  foodId: number;
  date: string;
  mealType: string;
  servingSize: number;
  servingSizeUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
  createdAt: string;
  food?: FoodData;
}

// Meal type enum
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// Interface for exercise data structure
export interface ExerciseData {
  id: number;
  name: string;
  category: string;
  caloriesBurnedPerMinute?: number;
  description?: string;
  isUserCreated: boolean;
}

// Interface for exercise entry
export interface ExerciseEntry {
  id: number;
  userId: number;
  exerciseId: number;
  date: string;
  duration: number;
  intensity: string;
  caloriesBurned: number;
  notes?: string;
  createdAt: string;
  exercise?: ExerciseData;
}

// Interface for water entry
export interface WaterEntry {
  id: number;
  userId: number;
  date: string;
  amount: number;
  createdAt: string;
}

// Interface for weight entry
export interface WeightEntry {
  id: number;
  userId: number;
  date: string;
  weight: number;
  notes?: string;
  createdAt: string;
}