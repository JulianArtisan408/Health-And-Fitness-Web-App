import { users, type User, type InsertUser, 
  foods, type Food, type InsertFood,
  foodEntries, type FoodEntry, type InsertFoodEntry,
  exercises, type Exercise, type InsertExercise,
  exerciseEntries, type ExerciseEntry, type InsertExerciseEntry,
  waterEntries, type WaterEntry, type InsertWaterEntry,
  weightEntries, type WeightEntry, type InsertWeightEntry,
  userFavoriteItems, type UserFavoriteItem, type InsertUserFavoriteItem
} from "@shared/schema";
import { db } from "./db";
import { eq, and, between, desc, isNull, sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import pkg from 'pg';
const { Pool } = pkg;

// Create session store
const PostgresSessionStore = connectPg(session);
const sessionStore = new PostgresSessionStore({
  conObject: {
    connectionString: process.env.DATABASE_URL,
  },
  createTableIfMissing: true
});

// Extended storage interface with methods for all models
export interface IStorage {
  // Session store
  sessionStore: session.Store;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // Food methods
  getFood(id: number): Promise<Food | undefined>;
  getFoodByName(name: string): Promise<Food[]>;
  getFoodByBarcode(barcode: string): Promise<Food | undefined>;
  searchFoods(query: string, limit?: number): Promise<Food[]>;
  createFood(food: InsertFood): Promise<Food>;
  
  // Food entry methods
  getFoodEntries(userId: number, date?: Date): Promise<FoodEntry[]>;
  getFoodEntry(id: number): Promise<FoodEntry | undefined>;
  createFoodEntry(entry: InsertFoodEntry): Promise<FoodEntry>;
  updateFoodEntry(id: number, data: Partial<InsertFoodEntry>): Promise<FoodEntry | undefined>;
  deleteFoodEntry(id: number): Promise<boolean>;
  
  // Exercise methods
  getExercise(id: number): Promise<Exercise | undefined>;
  searchExercises(query: string, limit?: number): Promise<Exercise[]>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  
  // Exercise entry methods
  getExerciseEntries(userId: number, date?: Date): Promise<ExerciseEntry[]>;
  getExerciseEntry(id: number): Promise<ExerciseEntry | undefined>;
  createExerciseEntry(entry: InsertExerciseEntry): Promise<ExerciseEntry>;
  updateExerciseEntry(id: number, data: Partial<InsertExerciseEntry>): Promise<ExerciseEntry | undefined>;
  deleteExerciseEntry(id: number): Promise<boolean>;
  
  // Water tracking methods
  getWaterEntries(userId: number, date?: Date): Promise<WaterEntry[]>;
  createWaterEntry(entry: InsertWaterEntry): Promise<WaterEntry>;
  updateWaterEntry(id: number, amount: number): Promise<WaterEntry | undefined>;
  deleteWaterEntry(id: number): Promise<boolean>;
  
  // Weight tracking methods
  getWeightEntries(userId: number, startDate?: Date, endDate?: Date): Promise<WeightEntry[]>;
  getLatestWeight(userId: number): Promise<WeightEntry | undefined>;
  createWeightEntry(entry: InsertWeightEntry): Promise<WeightEntry>;
  updateWeightEntry(id: number, data: Partial<InsertWeightEntry>): Promise<WeightEntry | undefined>;
  deleteWeightEntry(id: number): Promise<boolean>;
  
  // Favorites methods
  getUserFavorites(userId: number, type: 'food' | 'exercise'): Promise<UserFavoriteItem[]>;
  toggleFavorite(userId: number, itemType: 'food' | 'exercise', itemId: number): Promise<UserFavoriteItem | undefined>;
  
  // Dashboard & reporting methods
  getNutritionSummary(userId: number, date: Date): Promise<{
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    mealBreakdown: {
      [key: string]: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      }
    };
  }>;
  
  getCaloriesSummary(userId: number, date: Date): Promise<{
    consumed: number;
    burned: number;
    net: number;
  }>;
  
  getProgressReport(userId: number, startDate: Date, endDate: Date): Promise<{
    weightEntries: WeightEntry[];
    dailyCalories: { date: string; consumed: number; burned: number; net: number }[];
    dailyNutrients: { date: string; protein: number; carbs: number; fat: number }[];
    exerciseMinutes: { date: string; minutes: number }[];
  }>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = sessionStore;
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  // Food methods
  async getFood(id: number): Promise<Food | undefined> {
    const [food] = await db.select().from(foods).where(eq(foods.id, id));
    return food;
  }
  
  async getFoodByName(name: string): Promise<Food[]> {
    return db.select().from(foods).where(eq(foods.name, name));
  }
  
  async getFoodByBarcode(barcode: string): Promise<Food | undefined> {
    const [food] = await db.select().from(foods).where(eq(foods.barcode, barcode));
    return food;
  }
  
  async searchFoods(query: string, limit: number = 20): Promise<Food[]> {
    // Using SQL ILIKE for case-insensitive search
    return db
      .select()
      .from(foods)
      .where(sql`${foods.name} ILIKE ${'%' + query + '%'}`)
      .limit(limit);
  }
  
  async createFood(food: InsertFood): Promise<Food> {
    const [newFood] = await db.insert(foods).values(food).returning();
    return newFood;
  }
  
  // Food entry methods
  async getFoodEntries(userId: number, date?: Date): Promise<FoodEntry[]> {
    if (date) {
      // Format date to ISO string date (YYYY-MM-DD)
      const dateStr = date.toISOString().split('T')[0];
      
      return db
        .select()
        .from(foodEntries)
        .where(and(
          eq(foodEntries.userId, userId),
          eq(foodEntries.date, dateStr)
        ))
        .orderBy(foodEntries.mealType);
    } else {
      return db
        .select()
        .from(foodEntries)
        .where(eq(foodEntries.userId, userId))
        .orderBy(desc(foodEntries.date), foodEntries.mealType);
    }
  }
  
  async getFoodEntry(id: number): Promise<FoodEntry | undefined> {
    const [entry] = await db.select().from(foodEntries).where(eq(foodEntries.id, id));
    return entry;
  }
  
  async createFoodEntry(entry: InsertFoodEntry): Promise<FoodEntry> {
    const [newEntry] = await db.insert(foodEntries).values(entry).returning();
    return newEntry;
  }
  
  async updateFoodEntry(id: number, data: Partial<InsertFoodEntry>): Promise<FoodEntry | undefined> {
    const [updatedEntry] = await db
      .update(foodEntries)
      .set(data)
      .where(eq(foodEntries.id, id))
      .returning();
    return updatedEntry;
  }
  
  async deleteFoodEntry(id: number): Promise<boolean> {
    const result = await db.delete(foodEntries).where(eq(foodEntries.id, id)).returning();
    return result.length > 0;
  }
  
  // Exercise methods
  async getExercise(id: number): Promise<Exercise | undefined> {
    const [exercise] = await db.select().from(exercises).where(eq(exercises.id, id));
    return exercise;
  }
  
  async searchExercises(query: string, limit: number = 20): Promise<Exercise[]> {
    return db
      .select()
      .from(exercises)
      .where(sql`${exercises.name} ILIKE ${'%' + query + '%'}`)
      .limit(limit);
  }
  
  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const [newExercise] = await db.insert(exercises).values(exercise).returning();
    return newExercise;
  }
  
  // Exercise entry methods
  async getExerciseEntries(userId: number, date?: Date): Promise<ExerciseEntry[]> {
    if (date) {
      // Format date to ISO string date (YYYY-MM-DD)
      const dateStr = date.toISOString().split('T')[0];
      
      return db
        .select()
        .from(exerciseEntries)
        .where(and(
          eq(exerciseEntries.userId, userId),
          eq(exerciseEntries.date, dateStr)
        ))
        .orderBy(desc(exerciseEntries.createdAt));
    } else {
      return db
        .select()
        .from(exerciseEntries)
        .where(eq(exerciseEntries.userId, userId))
        .orderBy(desc(exerciseEntries.date), desc(exerciseEntries.createdAt));
    }
  }
  
  async getExerciseEntry(id: number): Promise<ExerciseEntry | undefined> {
    const [entry] = await db.select().from(exerciseEntries).where(eq(exerciseEntries.id, id));
    return entry;
  }
  
  async createExerciseEntry(entry: InsertExerciseEntry): Promise<ExerciseEntry> {
    const [newEntry] = await db.insert(exerciseEntries).values(entry).returning();
    return newEntry;
  }
  
  async updateExerciseEntry(id: number, data: Partial<InsertExerciseEntry>): Promise<ExerciseEntry | undefined> {
    const [updatedEntry] = await db
      .update(exerciseEntries)
      .set(data)
      .where(eq(exerciseEntries.id, id))
      .returning();
    return updatedEntry;
  }
  
  async deleteExerciseEntry(id: number): Promise<boolean> {
    const result = await db.delete(exerciseEntries).where(eq(exerciseEntries.id, id)).returning();
    return result.length > 0;
  }
  
  // Water tracking methods
  async getWaterEntries(userId: number, date?: Date): Promise<WaterEntry[]> {
    if (date) {
      // Format date to ISO string date (YYYY-MM-DD)
      const dateStr = date.toISOString().split('T')[0];
      
      return db
        .select()
        .from(waterEntries)
        .where(and(
          eq(waterEntries.userId, userId),
          eq(waterEntries.date, dateStr)
        ))
        .orderBy(desc(waterEntries.createdAt));
    } else {
      return db
        .select()
        .from(waterEntries)
        .where(eq(waterEntries.userId, userId))
        .orderBy(desc(waterEntries.date), desc(waterEntries.createdAt));
    }
  }
  
  async createWaterEntry(entry: InsertWaterEntry): Promise<WaterEntry> {
    const [newEntry] = await db.insert(waterEntries).values(entry).returning();
    return newEntry;
  }
  
  async updateWaterEntry(id: number, amount: number): Promise<WaterEntry | undefined> {
    const [updatedEntry] = await db
      .update(waterEntries)
      .set({ amount })
      .where(eq(waterEntries.id, id))
      .returning();
    return updatedEntry;
  }
  
  async deleteWaterEntry(id: number): Promise<boolean> {
    const result = await db.delete(waterEntries).where(eq(waterEntries.id, id)).returning();
    return result.length > 0;
  }
  
  // Weight tracking methods
  async getWeightEntries(userId: number, startDate?: Date, endDate?: Date): Promise<WeightEntry[]> {
    if (startDate && endDate) {
      // Format dates to ISO string date (YYYY-MM-DD)
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      return db
        .select()
        .from(weightEntries)
        .where(and(
          eq(weightEntries.userId, userId),
          between(weightEntries.date, startDateStr, endDateStr)
        ))
        .orderBy(desc(weightEntries.date));
    } else {
      return db
        .select()
        .from(weightEntries)
        .where(eq(weightEntries.userId, userId))
        .orderBy(desc(weightEntries.date));
    }
  }
  
  async getLatestWeight(userId: number): Promise<WeightEntry | undefined> {
    const [entry] = await db
      .select()
      .from(weightEntries)
      .where(eq(weightEntries.userId, userId))
      .orderBy(desc(weightEntries.date))
      .limit(1);
    return entry;
  }
  
  async getWeightEntry(id: number): Promise<WeightEntry | undefined> {
    const [entry] = await db.select().from(weightEntries).where(eq(weightEntries.id, id));
    return entry;
  }
  
  async createWeightEntry(entry: InsertWeightEntry): Promise<WeightEntry> {
    const [newEntry] = await db.insert(weightEntries).values(entry).returning();
    return newEntry;
  }
  
  async updateWeightEntry(id: number, data: Partial<InsertWeightEntry>): Promise<WeightEntry | undefined> {
    const [updatedEntry] = await db
      .update(weightEntries)
      .set(data)
      .where(eq(weightEntries.id, id))
      .returning();
    return updatedEntry;
  }
  
  async deleteWeightEntry(id: number): Promise<boolean> {
    const result = await db.delete(weightEntries).where(eq(weightEntries.id, id)).returning();
    return result.length > 0;
  }
  
  // Favorites methods
  async getUserFavorites(userId: number, type: 'food' | 'exercise'): Promise<UserFavoriteItem[]> {
    if (type === 'food') {
      return db
        .select()
        .from(userFavoriteItems)
        .where(and(
          eq(userFavoriteItems.userId, userId),
          isNull(userFavoriteItems.exerciseId)
        ));
    } else {
      return db
        .select()
        .from(userFavoriteItems)
        .where(and(
          eq(userFavoriteItems.userId, userId),
          isNull(userFavoriteItems.foodId)
        ));
    }
  }
  
  async toggleFavorite(userId: number, itemType: 'food' | 'exercise', itemId: number): Promise<UserFavoriteItem | undefined> {
    // Check if the favorite exists
    const existingFavorite = await db
      .select()
      .from(userFavoriteItems)
      .where(and(
        eq(userFavoriteItems.userId, userId),
        itemType === 'food' 
          ? eq(userFavoriteItems.foodId, itemId) 
          : eq(userFavoriteItems.exerciseId, itemId)
      ))
      .limit(1);
    
    // If it exists, delete it
    if (existingFavorite.length > 0) {
      await db
        .delete(userFavoriteItems)
        .where(eq(userFavoriteItems.id, existingFavorite[0].id));
      return undefined;
    }
    
    // Otherwise, add a new favorite
    const newFavorite = {
      userId,
      foodId: itemType === 'food' ? itemId : undefined,
      exerciseId: itemType === 'exercise' ? itemId : undefined
    };
    
    const [favorite] = await db.insert(userFavoriteItems).values(newFavorite).returning();
    return favorite;
  }
  
  // Dashboard & reporting methods
  async getNutritionSummary(userId: number, date: Date): Promise<{
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    mealBreakdown: {
      [key: string]: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      }
    };
  }> {
    const entries = await this.getFoodEntries(userId, date);
    
    const result = {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      mealBreakdown: {} as {
        [key: string]: {
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
        }
      }
    };
    
    // Process each food entry
    for (const entry of entries) {
      // Add to totals
      result.totalCalories += entry.calories;
      result.totalProtein += entry.protein;
      result.totalCarbs += entry.carbs;
      result.totalFat += entry.fat;
      
      // Initialize meal breakdown if needed
      if (!result.mealBreakdown[entry.mealType]) {
        result.mealBreakdown[entry.mealType] = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        };
      }
      
      // Add to meal breakdown
      result.mealBreakdown[entry.mealType].calories += entry.calories;
      result.mealBreakdown[entry.mealType].protein += entry.protein;
      result.mealBreakdown[entry.mealType].carbs += entry.carbs;
      result.mealBreakdown[entry.mealType].fat += entry.fat;
    }
    
    return result;
  }
  
  async getCaloriesSummary(userId: number, date: Date): Promise<{
    consumed: number;
    burned: number;
    net: number;
  }> {
    // Get food entries to calculate consumed calories
    const foodEntries = await this.getFoodEntries(userId, date);
    const consumed = foodEntries.reduce((total, entry) => total + entry.calories, 0);
    
    // Get exercise entries to calculate burned calories
    const exerciseEntries = await this.getExerciseEntries(userId, date);
    const burned = exerciseEntries.reduce((total, entry) => total + entry.caloriesBurned, 0);
    
    return {
      consumed,
      burned,
      net: consumed - burned
    };
  }
  
  async getProgressReport(userId: number, startDate: Date, endDate: Date): Promise<{
    weightEntries: WeightEntry[];
    dailyCalories: { date: string; consumed: number; burned: number; net: number }[];
    dailyNutrients: { date: string; protein: number; carbs: number; fat: number }[];
    exerciseMinutes: { date: string; minutes: number }[];
  }> {
    // Create an array of dates between startDate and endDate
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Get weight entries
    const weightEntries = await this.getWeightEntries(userId, startDate, endDate);
    
    // Initialize result arrays
    const dailyCalories: { date: string; consumed: number; burned: number; net: number }[] = [];
    const dailyNutrients: { date: string; protein: number; carbs: number; fat: number }[] = [];
    const exerciseMinutes: { date: string; minutes: number }[] = [];
    
    // Calculate daily data for each date
    for (const date of dates) {
      const dateString = date.toISOString().split('T')[0];
      
      // Get calories summary
      const caloriesSummary = await this.getCaloriesSummary(userId, date);
      dailyCalories.push({
        date: dateString,
        ...caloriesSummary
      });
      
      // Get nutrition summary
      const nutritionSummary = await this.getNutritionSummary(userId, date);
      dailyNutrients.push({
        date: dateString,
        protein: nutritionSummary.totalProtein,
        carbs: nutritionSummary.totalCarbs,
        fat: nutritionSummary.totalFat
      });
      
      // Get exercise entries
      const exerciseEntriesForDay = await this.getExerciseEntries(userId, date);
      const minutes = exerciseEntriesForDay.reduce((total, entry) => total + entry.duration, 0);
      exerciseMinutes.push({
        date: dateString,
        minutes
      });
    }
    
    return {
      weightEntries,
      dailyCalories,
      dailyNutrients,
      exerciseMinutes
    };
  }
}

export const storage = new DatabaseStorage();
