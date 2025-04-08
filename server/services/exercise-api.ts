import { Exercise, InsertExercise } from '@shared/schema';
import { exercises, exerciseCategories, categoryMultipliers } from '../data/exercise-data';

/**
 * Search for exercises in our local exercise database
 * @param query Search query
 * @returns Array of exercises matching the query
 */
export async function searchExercisesFromAPI(query: string): Promise<InsertExercise[]> {
  // Normalize the query for case-insensitive search
  const normalizedQuery = query.toLowerCase();
  
  // Filter exercises that match the query
  const matchingExercises = exercises.filter(exercise => 
    exercise.name.toLowerCase().includes(normalizedQuery) || 
    exercise.category.toLowerCase().includes(normalizedQuery) ||
    (exercise.description && exercise.description.toLowerCase().includes(normalizedQuery))
  );
  
  return matchingExercises;
}

/**
 * Get all available exercise categories
 * @returns Array of exercise categories
 */
export async function getExerciseCategories(): Promise<string[]> {
  return exerciseCategories;
}

/**
 * Get exercises by category
 * @param category Exercise category
 * @returns Array of exercises in the specified category
 */
export async function getExercisesByCategory(category: string): Promise<InsertExercise[]> {
  const normalizedCategory = category.toLowerCase();
  return exercises.filter(exercise => 
    exercise.category.toLowerCase() === normalizedCategory
  );
}

/**
 * Calculate calories burned based on exercise, duration, and intensity
 * @param exercise Exercise data
 * @param durationMinutes Duration in minutes
 * @param intensity Intensity level (low, medium, high)
 * @returns Calories burned
 */
export function calculateCaloriesBurned(
  exercise: Exercise, 
  durationMinutes: number, 
  intensity: 'low' | 'medium' | 'high'
): number {
  // If the exercise has a predefined calorie burn rate, use that
  if (exercise.caloriesBurnedPerMinute) {
    // Apply intensity multiplier
    const intensityMultiplier = intensity === 'low' ? 0.8 : intensity === 'medium' ? 1 : 1.2;
    return Math.round(exercise.caloriesBurnedPerMinute * durationMinutes * intensityMultiplier);
  }

  // Get the category multiplier or use 1.0 as default
  const category = exercise.category.toLowerCase();
  const categoryKey = category as keyof typeof categoryMultipliers;
  const categoryMultiplier = categoryMultipliers[categoryKey] || 1.0;
  
  // Base calorie rates by intensity
  const baseRates = {
    'low': 3.5,
    'medium': 6.5,
    'high': 10
  };
  
  // Calculate calories
  const baseCalories = baseRates[intensity];
  const adjustedCalories = baseCalories * categoryMultiplier * durationMinutes;
  
  return Math.round(adjustedCalories);
}