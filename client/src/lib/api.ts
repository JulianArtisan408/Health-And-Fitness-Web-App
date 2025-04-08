import { apiRequest } from './queryClient';
import type { FoodData, ExerciseData, ExerciseEntry, FoodEntry } from '../types';

/**
 * Searches for foods in the USDA database
 * @param query The search query
 * @param pageSize Number of results to return (default: 50)
 * @param pageNumber Page number for pagination (default: 1)
 */
export async function searchUSDAFoods(query: string, pageSize: number = 50, pageNumber: number = 1): Promise<FoodData[]> {
  const searchParams = new URLSearchParams({
    query,
    pageSize: pageSize.toString(),
    pageNumber: pageNumber.toString(),
  });
  
  return await apiRequest<FoodData[]>({
    method: 'GET',
    url: `/api/usda/foods/search?${searchParams.toString()}`
  });
}

/**
 * Gets detailed information about a specific food item from the USDA database
 * @param id The USDA food ID
 */
export async function getUSDAFoodDetails(id: number): Promise<FoodData> {
  return await apiRequest<FoodData>({
    method: 'GET',
    url: `/api/usda/foods/${id}`
  });
}

/**
 * Searches for foods in the local database
 * @param query The search query
 * @param limit Maximum number of results to return (default: 20)
 */
export async function searchLocalFoods(query: string, limit: number = 20): Promise<FoodData[]> {
  const searchParams = new URLSearchParams({
    query,
    limit: limit.toString(),
  });
  
  return await apiRequest<FoodData[]>({
    method: 'GET',
    url: `/api/foods/search?${searchParams.toString()}`
  });
}

/**
 * Creates a new food in the database
 * @param foodData The food data
 */
export async function createFood(foodData: Partial<FoodData>) {
  return await apiRequest<FoodData>({
    method: 'POST',
    url: '/api/foods',
    body: JSON.stringify(foodData),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Adds a food entry to the user's food log
 * @param entryData The food entry data
 */
export async function addFoodEntry(entryData: any) {
  return await apiRequest<FoodEntry>({
    method: 'POST',
    url: '/api/food-entries',
    body: JSON.stringify(entryData),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Updates a food entry in the user's food log
 * @param id The entry ID
 * @param entryData The updated food entry data
 */
export async function updateFoodEntry(id: number, entryData: any) {
  return await apiRequest<FoodEntry>({
    method: 'PUT',
    url: `/api/food-entries/${id}`,
    body: JSON.stringify(entryData),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Deletes a food entry from the user's food log
 * @param id The entry ID
 */
export async function deleteFoodEntry(id: number) {
  return await apiRequest({
    method: 'DELETE',
    url: `/api/food-entries/${id}`
  });
}

/**
 * Searches for exercises in the database
 * @param query The search query
 */
export async function searchExercises(query: string): Promise<ExerciseData[]> {
  return await apiRequest<ExerciseData[]>({
    method: 'GET',
    url: `/api/exercises/search?query=${encodeURIComponent(query)}`
  });
}

/**
 * Gets available exercise categories
 */
export async function getExerciseCategories(): Promise<string[]> {
  return await apiRequest<string[]>({
    method: 'GET',
    url: '/api/exercises/categories'
  });
}

/**
 * Gets exercises by category
 * @param category The exercise category
 * @param limit Maximum number of results to return
 */
export async function getExercisesByCategory(category: string, limit: number = 20): Promise<ExerciseData[]> {
  return await apiRequest<ExerciseData[]>({
    method: 'GET',
    url: `/api/exercises/category/${encodeURIComponent(category)}?limit=${limit}`
  });
}

/**
 * Creates a custom exercise
 * @param exercise The exercise data to create
 */
export async function createExercise(exercise: Omit<ExerciseData, 'id'>): Promise<ExerciseData> {
  return await apiRequest<ExerciseData>({
    method: 'POST',
    url: '/api/exercises',
    body: JSON.stringify(exercise),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Gets exercise entries for a specific date
 * @param date The date to get entries for (YYYY-MM-DD format)
 */
export async function getExerciseEntries(date: string): Promise<ExerciseEntry[]> {
  return await apiRequest<ExerciseEntry[]>({
    method: 'GET',
    url: `/api/exercise-entries?date=${date}`
  });
}

/**
 * Creates a new exercise entry
 * @param entry The entry data to create
 */
export async function createExerciseEntry(entry: Omit<ExerciseEntry, 'id' | 'userId' | 'createdAt' | 'exercise'>): Promise<ExerciseEntry> {
  return await apiRequest<ExerciseEntry>({
    method: 'POST',
    url: '/api/exercise-entries',
    body: JSON.stringify(entry),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Updates an exercise entry in the user's log
 * @param id The entry ID
 * @param entryData The updated exercise entry data
 */
export async function updateExerciseEntry(id: number, entryData: any) {
  return await apiRequest<ExerciseEntry>({
    method: 'PUT',
    url: `/api/exercise-entries/${id}`,
    body: JSON.stringify(entryData),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Deletes an exercise entry from the user's log
 * @param id The entry ID
 */
export async function deleteExerciseEntry(id: number) {
  return await apiRequest({
    method: 'DELETE',
    url: `/api/exercise-entries/${id}`
  });
}

/**
 * Gets a summary of calories consumed, burned, and net for a specific date
 * @param date The date to get the summary for (YYYY-MM-DD format)
 */
export async function getCaloriesSummary(date: string): Promise<{consumed: number, burned: number, net: number}> {
  return await apiRequest<{consumed: number, burned: number, net: number}>({
    method: 'GET',
    url: `/api/calories/summary?date=${date}`
  });
}