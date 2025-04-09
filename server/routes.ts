import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { format } from "date-fns";
import { setupAuth } from "./auth";
import { 
  insertFoodSchema, 
  insertFoodEntrySchema, 
  insertExerciseSchema, 
  insertExerciseEntrySchema,
  insertWaterEntrySchema,
  insertWeightEntrySchema,
  type User
} from "@shared/schema";
import { searchFoods as searchUSDAFoods, getFoodDetails as getUSDAFoodDetails } from "./services/usda-api";
import { searchExercisesFromAPI, getExerciseCategories, getExercisesByCategory, calculateCaloriesBurned } from "./services/exercise-api";
import { exercises } from "./data/exercise-data";

// Add a type declaration for req.user with non-null assertion
type RequestWithUser = Request & { user: any };

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });
  
  // Debug endpoint for exercise database
  app.get("/api/debug/exercises", async (_req: Request, res: Response) => {
    try {
      const allCategories = await getExerciseCategories();
      const sampleExercises = await searchExercisesFromAPI("run");
      res.json({
        categories: allCategories,
        sampleExercises: sampleExercises.slice(0, 3),
        totalSampleResults: sampleExercises.length
      });
    } catch (err) {
      console.error("Error fetching debug exercise data:", err);
      res.status(500).json({ error: "Failed to fetch exercise data" });
    }
  });
  
  // Endpoint to seed exercise database - this is a one-time setup endpoint
  app.get("/api/seed/exercises", async (_req: Request, res: Response) => {
    try {
      let createdCount = 0;
      let existingCount = 0;
      
      // Seed the database with our pre-defined exercises
      for (const exercise of exercises) {
        try {
          // Check if exercise already exists with same name to avoid duplicates
          const existingExercises = await storage.searchExercises(exercise.name, 1);
          
          if (existingExercises.length === 0) {
            await storage.createExercise(exercise);
            createdCount++;
          } else {
            existingCount++;
          }
        } catch (err) {
          console.error(`Error saving exercise ${exercise.name}:`, err);
        }
      }
      
      res.json({
        success: true,
        message: `Exercise database seeded with ${createdCount} new exercises. ${existingCount} exercises already existed.`,
        totalProcessed: createdCount + existingCount,
        totalAvailable: exercises.length
      });
    } catch (err) {
      console.error("Error seeding exercise database:", err);
      res.status(500).json({ error: "Failed to seed exercise database" });
    }
  });
  
  // USDA Food API endpoints
  app.get("/api/usda/foods/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.query as string;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 50;
      const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber as string) : 1;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const foods = await searchUSDAFoods(query, pageSize, pageNumber);
      res.json(foods);
    } catch (error) {
      console.error("Error searching USDA foods:", error);
      res.status(500).json({ message: "Failed to search foods from USDA API" });
    }
  });
  
  app.get("/api/usda/foods/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid food ID" });
      }
      
      const food = await getUSDAFoodDetails(id);
      res.json(food);
    } catch (error) {
      console.error("Error fetching USDA food details:", error);
      res.status(500).json({ message: "Failed to get food details from USDA API" });
    }
  });
  
  // Local Food API endpoints
  app.get("/api/foods/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.query as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const foods = await storage.searchFoods(query, limit);
      res.json(foods);
    } catch (error) {
      console.error("Error searching foods:", error);
      res.status(500).json({ message: "Failed to search foods" });
    }
  });

  app.get("/api/foods/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid food ID" });
      }
      
      const food = await storage.getFood(id);
      if (!food) {
        return res.status(404).json({ message: "Food not found" });
      }
      
      res.json(food);
    } catch (error) {
      console.error("Error getting food:", error);
      res.status(500).json({ message: "Failed to get food details" });
    }
  });

  app.post("/api/foods", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const foodData = insertFoodSchema.parse({
        ...req.body,
        isUserCreated: true
      });
      
      const food = await storage.createFood(foodData);
      res.status(201).json(food);
    } catch (error) {
      console.error("Error creating food:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid food data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to create food" });
    }
  });

  // Food entries API endpoints
  app.get("/api/food-entries", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = (req.user as any).id;
      const dateStr = req.query.date as string;
      let date: Date | undefined;
      
      if (dateStr) {
        date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
      }
      
      const entries = await storage.getFoodEntries(userId, date);
      res.json(entries);
    } catch (error) {
      console.error("Error getting food entries:", error);
      res.status(500).json({ message: "Failed to get food entries" });
    }
  });

  app.post("/api/food-entries", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      const entryData = insertFoodEntrySchema.parse({
        ...req.body,
        userId
      });
      
      const entry = await storage.createFoodEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating food entry:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid food entry data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to create food entry" });
    }
  });

  app.put("/api/food-entries/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      const entryId = parseInt(req.params.id);
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      // Check if the entry exists and belongs to the user
      const existingEntry = await storage.getFoodEntry(entryId);
      if (!existingEntry) {
        return res.status(404).json({ message: "Food entry not found" });
      }
      
      if (existingEntry.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to update this entry" });
      }
      
      const updatedEntry = await storage.updateFoodEntry(entryId, req.body);
      res.json(updatedEntry);
    } catch (error) {
      console.error("Error updating food entry:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid food entry data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to update food entry" });
    }
  });

  app.delete("/api/food-entries/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      const entryId = parseInt(req.params.id);
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      // Check if the entry exists and belongs to the user
      const existingEntry = await storage.getFoodEntry(entryId);
      if (!existingEntry) {
        return res.status(404).json({ message: "Food entry not found" });
      }
      
      if (existingEntry.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this entry" });
      }
      
      const success = await storage.deleteFoodEntry(entryId);
      if (success) {
        res.json({ message: "Food entry deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete food entry" });
      }
    } catch (error) {
      console.error("Error deleting food entry:", error);
      res.status(500).json({ message: "Failed to delete food entry" });
    }
  });

  // Exercise API endpoints
  app.get("/api/exercises/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.query as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      // First search local database
      const localExercises = await storage.searchExercises(query, limit);
      
      // If we have enough results, return them
      if (localExercises.length >= limit) {
        return res.json(localExercises);
      }
      
      // Otherwise, search the API
      const apiExercises = await searchExercisesFromAPI(query);
      
      // Save the API exercises to our database for future searches
      for (const exercise of apiExercises) {
        try {
          // Check if exercise already exists with same name to avoid duplicates
          const existingExercises = await storage.searchExercises(exercise.name, 1);
          if (existingExercises.length === 0) {
            await storage.createExercise(exercise);
          }
        } catch (err) {
          console.error(`Error saving exercise ${exercise.name}:`, err);
        }
      }
      
      // Combine local and API results, remove duplicates, and limit to requested size
      const combinedExercises = [...localExercises];
      
      // Add API exercises that aren't already in local results
      for (const apiExercise of apiExercises) {
        const isDuplicate = combinedExercises.some(
          (e) => e.name.toLowerCase() === apiExercise.name.toLowerCase()
        );
        
        if (!isDuplicate && combinedExercises.length < limit) {
          const savedExercise = await storage.createExercise(apiExercise);
          combinedExercises.push(savedExercise);
        }
        
        if (combinedExercises.length >= limit) {
          break;
        }
      }
      
      res.json(combinedExercises);
    } catch (error) {
      console.error("Error searching exercises:", error);
      res.status(500).json({ message: "Failed to search exercises" });
    }
  });

  app.get("/api/exercises/categories", async (_req: Request, res: Response) => {
    try {
      // Get categories from API
      const categories = await getExerciseCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error getting exercise categories:", error);
      res.status(500).json({ message: "Failed to get exercise categories" });
    }
  });
  
  app.get("/api/exercises/category/:category", async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      // Get exercises for this category
      const apiExercises = await getExercisesByCategory(category);
      
      // Save exercises to database (up to limit)
      const savedExercises = [];
      
      for (const exercise of apiExercises.slice(0, limit)) {
        try {
          // Check if exercise already exists with same name to avoid duplicates
          const existingExercises = await storage.searchExercises(exercise.name, 1);
          
          if (existingExercises.length === 0) {
            const savedExercise = await storage.createExercise(exercise);
            savedExercises.push(savedExercise);
          } else {
            savedExercises.push(existingExercises[0]);
          }
          
          if (savedExercises.length >= limit) {
            break;
          }
        } catch (err) {
          console.error(`Error saving exercise ${exercise.name}:`, err);
        }
      }
      
      res.json(savedExercises);
    } catch (error) {
      console.error("Error getting exercises by category:", error);
      res.status(500).json({ message: "Failed to get exercises by category" });
    }
  });
  
  app.post("/api/exercises", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const exerciseData = insertExerciseSchema.parse({
        ...req.body,
        isUserCreated: true
      });
      
      const exercise = await storage.createExercise(exerciseData);
      res.status(201).json(exercise);
    } catch (error) {
      console.error("Error creating exercise:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid exercise data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to create exercise" });
    }
  });

  // Exercise entries API endpoints
  app.get("/api/exercise-entries", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      const dateStr = req.query.date as string;
      let date: Date | undefined;
      
      if (dateStr) {
        date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
      }
      
      const entries = await storage.getExerciseEntries(userId, date);
      res.json(entries);
    } catch (error) {
      console.error("Error getting exercise entries:", error);
      res.status(500).json({ message: "Failed to get exercise entries" });
    }
  });

  app.post("/api/exercise-entries", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      const entryData = insertExerciseEntrySchema.parse({
        ...req.body,
        userId
      });
      
      const entry = await storage.createExerciseEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating exercise entry:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid exercise entry data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to create exercise entry" });
    }
  });

  app.put("/api/exercise-entries/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      const entryId = parseInt(req.params.id);
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      // Check if the entry exists and belongs to the user
      const existingEntry = await storage.getExerciseEntry(entryId);
      if (!existingEntry) {
        return res.status(404).json({ message: "Exercise entry not found" });
      }
      
      if (existingEntry.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to update this entry" });
      }
      
      const updatedEntry = await storage.updateExerciseEntry(entryId, req.body);
      res.json(updatedEntry);
    } catch (error) {
      console.error("Error updating exercise entry:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid exercise entry data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to update exercise entry" });
    }
  });

  app.delete("/api/exercise-entries/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      const entryId = parseInt(req.params.id);
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      // Check if the entry exists and belongs to the user
      const existingEntry = await storage.getExerciseEntry(entryId);
      if (!existingEntry) {
        return res.status(404).json({ message: "Exercise entry not found" });
      }
      
      if (existingEntry.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this entry" });
      }
      
      const success = await storage.deleteExerciseEntry(entryId);
      if (success) {
        res.json({ message: "Exercise entry deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete exercise entry" });
      }
    } catch (error) {
      console.error("Error deleting exercise entry:", error);
      res.status(500).json({ message: "Failed to delete exercise entry" });
    }
  });

  // Water tracking API endpoints
  app.get("/api/water-entries", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      const dateStr = req.query.date as string;
      let date: Date | undefined;
      
      if (dateStr) {
        date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
      }
      
      const entries = await storage.getWaterEntries(userId, date);
      res.json(entries);
    } catch (error) {
      console.error("Error getting water entries:", error);
      res.status(500).json({ message: "Failed to get water entries" });
    }
  });

  app.post("/api/water-entries", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      const entryData = insertWaterEntrySchema.parse({
        ...req.body,
        userId
      });
      
      const entry = await storage.createWaterEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating water entry:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid water entry data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to create water entry" });
    }
  });

  app.put("/api/water-entries/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const entryId = parseInt(req.params.id);
      const amount = req.body.amount;
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      const updatedEntry = await storage.updateWaterEntry(entryId, amount);
      if (!updatedEntry) {
        return res.status(404).json({ message: "Water entry not found" });
      }
      
      res.json(updatedEntry);
    } catch (error) {
      console.error("Error updating water entry:", error);
      res.status(500).json({ message: "Failed to update water entry" });
    }
  });

  app.delete("/api/water-entries/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const entryId = parseInt(req.params.id);
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      const success = await storage.deleteWaterEntry(entryId);
      if (success) {
        res.json({ message: "Water entry deleted successfully" });
      } else {
        res.status(404).json({ message: "Water entry not found" });
      }
    } catch (error) {
      console.error("Error deleting water entry:", error);
      res.status(500).json({ message: "Failed to delete water entry" });
    }
  });

  // Weight tracking API endpoints
  app.get("/api/weight-entries", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      const startDateStr = req.query.startDate as string;
      const endDateStr = req.query.endDate as string;
      
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (startDateStr) {
        startDate = new Date(startDateStr);
        if (isNaN(startDate.getTime())) {
          return res.status(400).json({ message: "Invalid start date format" });
        }
      }
      
      if (endDateStr) {
        endDate = new Date(endDateStr);
        if (isNaN(endDate.getTime())) {
          return res.status(400).json({ message: "Invalid end date format" });
        }
      }
      
      const entries = await storage.getWeightEntries(userId, startDate, endDate);
      res.json(entries);
    } catch (error) {
      console.error("Error getting weight entries:", error);
      res.status(500).json({ message: "Failed to get weight entries" });
    }
  });

  app.get("/api/weight-entries/latest", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      const entry = await storage.getLatestWeight(userId);
      
      if (!entry) {
        return res.status(404).json({ message: "No weight entries found" });
      }
      
      res.json(entry);
    } catch (error) {
      console.error("Error getting latest weight entry:", error);
      res.status(500).json({ message: "Failed to get latest weight entry" });
    }
  });

  app.post("/api/weight-entries", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      const entryData = insertWeightEntrySchema.parse({
        ...req.body,
        userId
      });
      
      const entry = await storage.createWeightEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating weight entry:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid weight entry data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to create weight entry" });
    }
  });

  app.put("/api/weight-entries/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      const entryId = parseInt(req.params.id);
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      // Check if the entry exists and belongs to the user
      const existingEntry = await storage.getWeightEntry(entryId);
      if (!existingEntry) {
        return res.status(404).json({ message: "Weight entry not found" });
      }
      
      if (existingEntry.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to update this entry" });
      }
      
      const updatedEntry = await storage.updateWeightEntry(entryId, req.body);
      res.json(updatedEntry);
    } catch (error) {
      console.error("Error updating weight entry:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid weight entry data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to update weight entry" });
    }
  });

  app.delete("/api/weight-entries/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      const entryId = parseInt(req.params.id);
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      // Check if the entry exists and belongs to the user
      const existingEntry = await storage.getWeightEntry(entryId);
      if (!existingEntry) {
        return res.status(404).json({ message: "Weight entry not found" });
      }
      
      if (existingEntry.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this entry" });
      }
      
      const success = await storage.deleteWeightEntry(entryId);
      if (success) {
        res.json({ message: "Weight entry deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete weight entry" });
      }
    } catch (error) {
      console.error("Error deleting weight entry:", error);
      res.status(500).json({ message: "Failed to delete weight entry" });
    }
  });

  // User favorites API endpoints
  app.get("/api/favorites/:type", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      const type = req.params.type;
      
      if (type !== 'food' && type !== 'exercise') {
        return res.status(400).json({ message: "Invalid favorite type. Must be 'food' or 'exercise'" });
      }
      
      const favorites = await storage.getUserFavorites(userId, type);
      res.json(favorites);
    } catch (error) {
      console.error("Error getting user favorites:", error);
      res.status(500).json({ message: "Failed to get user favorites" });
    }
  });

  app.post("/api/favorites/toggle", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      const { itemType, itemId } = req.body;
      
      if (!itemType || (itemType !== 'food' && itemType !== 'exercise')) {
        return res.status(400).json({ message: "Invalid item type. Must be 'food' or 'exercise'" });
      }
      
      if (!itemId || typeof itemId !== 'number') {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      const result = await storage.toggleFavorite(userId, itemType, itemId);
      if (result) {
        res.status(201).json({ 
          message: "Item added to favorites", 
          favorite: result 
        });
      } else {
        res.status(200).json({ 
          message: "Item removed from favorites" 
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      res.status(500).json({ message: "Failed to toggle favorite" });
    }
  });

  // Nutrition and progress reporting API endpoints
  app.get("/api/nutrition/summary", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      const dateStr = req.query.date as string;
      
      if (!dateStr) {
        return res.status(400).json({ message: "Date parameter is required" });
      }
      
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const summary = await storage.getNutritionSummary(userId, date);
      res.json(summary);
    } catch (error) {
      console.error("Error getting nutrition summary:", error);
      res.status(500).json({ message: "Failed to get nutrition summary" });
    }
  });

  app.get("/api/calories/summary", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      const dateStr = req.query.date as string;
      
      if (!dateStr) {
        return res.status(400).json({ message: "Date parameter is required" });
      }
      
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const summary = await storage.getCaloriesSummary(userId, date);
      res.json(summary);
    } catch (error) {
      console.error("Error getting calories summary:", error);
      res.status(500).json({ message: "Failed to get calories summary" });
    }
  });

  app.get("/api/progress/report", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      const startDateStr = req.query.startDate as string;
      const endDateStr = req.query.endDate as string;
      
      if (!startDateStr || !endDateStr) {
        return res.status(400).json({ message: "Both startDate and endDate parameters are required" });
      }
      
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      if (startDate > endDate) {
        return res.status(400).json({ message: "startDate must be before endDate" });
      }
      
      const report = await storage.getProgressReport(userId, startDate, endDate);
      res.json(report);
    } catch (error) {
      console.error("Error getting progress report:", error);
      res.status(500).json({ message: "Failed to get progress report" });
    }
  });

  // User profile API endpoints
  app.get("/api/profile", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Return user data without password
      const { password, ...userWithoutPassword } = req.user as any;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error getting user profile:", error);
      res.status(500).json({ message: "Failed to get user profile" });
    }
  });

  app.put("/api/profile", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      
      // Don't allow updating email, username or password through this endpoint
      const { email, username, password, ...updateData } = req.body;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return updated user without password
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user profile:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid profile data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}