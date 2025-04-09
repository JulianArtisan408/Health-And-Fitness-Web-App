import { pgTable, text, serial, integer, boolean, timestamp, date, real, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Enums using Zod for client-side validation
export const genderEnum = z.enum(['male', 'female', 'other', 'prefer_not_to_say']);
export const activityLevelEnum = z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']);
export const goalEnum = z.enum(['lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle', 'improve_fitness']);
export const mealTypeEnum = z.enum(['breakfast', 'lunch', 'dinner', 'snack']);
export const exerciseIntensityEnum = z.enum(['low', 'medium', 'high']);
export const unitEnum = z.enum(['g', 'mg', 'mcg', 'oz', 'ml', 'tbsp', 'tsp', 'cup', 'serving']);

// Users table - simplified for basic registration
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  displayName: text("display_name"), // For personalization
  theme: text("theme").default("blue"), // For UI customization
  createdAt: timestamp("created_at").defaultNow(),
});

// User profile relations
export const usersRelations = relations(users, ({ many }) => ({
  foodEntries: many(foodEntries),
  exerciseEntries: many(exerciseEntries),
  waterEntries: many(waterEntries),
  weightEntries: many(weightEntries),
  userFavoriteItems: many(userFavoriteItems),
}));

// Foods database
export const foods = pgTable("foods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand"),
  servingSize: real("serving_size").notNull(),
  servingSizeUnit: text("serving_size_unit").notNull(),
  calories: integer("calories").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  sugar: real("sugar"),
  fiber: real("fiber"),
  fat: real("fat").notNull(),
  saturatedFat: real("saturated_fat"),
  transFat: real("trans_fat"),
  cholesterol: real("cholesterol"),
  sodium: real("sodium"),
  potassium: real("potassium"),
  calcium: real("calcium"),
  iron: real("iron"),
  vitaminA: real("vitamin_a"),
  vitaminC: real("vitamin_c"),
  vitaminD: real("vitamin_d"),
  barcode: text("barcode").unique(),
  isVerified: boolean("is_verified").default(false),
  isUserCreated: boolean("is_user_created").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Food relations
export const foodsRelations = relations(foods, ({ many }) => ({
  foodEntries: many(foodEntries),
  userFavoriteItems: many(userFavoriteItems),
}));

// Food log entries
export const foodEntries = pgTable("food_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  foodId: integer("food_id").notNull().references(() => foods.id),
  date: date("date").notNull(),
  mealType: text("meal_type").notNull(),
  servingSize: real("serving_size").notNull(),
  servingSizeUnit: text("serving_size_unit").notNull(),
  calories: integer("calories").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fat: real("fat").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Food entries relations
export const foodEntriesRelations = relations(foodEntries, ({ one }) => ({
  user: one(users, {
    fields: [foodEntries.userId],
    references: [users.id],
  }),
  food: one(foods, {
    fields: [foodEntries.foodId],
    references: [foods.id],
  }),
}));

// Exercise database
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  caloriesBurnedPerMinute: real("calories_burned_per_minute"),
  description: text("description"),
  isUserCreated: boolean("is_user_created").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Exercise relations
export const exercisesRelations = relations(exercises, ({ many }) => ({
  exerciseEntries: many(exerciseEntries),
  userFavoriteItems: many(userFavoriteItems),
}));

// Exercise log entries
export const exerciseEntries = pgTable("exercise_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  exerciseId: integer("exercise_id").notNull().references(() => exercises.id),
  date: date("date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  intensity: text("intensity").notNull(),
  caloriesBurned: integer("calories_burned").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Exercise entries relations
export const exerciseEntriesRelations = relations(exerciseEntries, ({ one }) => ({
  user: one(users, {
    fields: [exerciseEntries.userId],
    references: [users.id],
  }),
  exercise: one(exercises, {
    fields: [exerciseEntries.exerciseId],
    references: [exercises.id],
  }),
}));

// Water tracking
export const waterEntries = pgTable("water_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date("date").notNull(),
  amount: integer("amount").notNull(), // in ml
  createdAt: timestamp("created_at").defaultNow(),
});

// Water entries relations
export const waterEntriesRelations = relations(waterEntries, ({ one }) => ({
  user: one(users, {
    fields: [waterEntries.userId],
    references: [users.id],
  }),
}));

// Weight tracking
export const weightEntries = pgTable("weight_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date("date").notNull(),
  weight: real("weight").notNull(),
  weightUnit: text("weight_unit").default("kg").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Weight entries relations
export const weightEntriesRelations = relations(weightEntries, ({ one }) => ({
  user: one(users, {
    fields: [weightEntries.userId],
    references: [users.id],
  }),
}));

// User favorites (foods and exercises)
export const userFavoriteItems = pgTable("user_favorite_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  foodId: integer("food_id").references(() => foods.id),
  exerciseId: integer("exercise_id").references(() => exercises.id),
  createdAt: timestamp("created_at").defaultNow(),
},
(table) => {
  return {
    uniqueFavorite: unique("unique_favorite").on(
      table.userId, 
      table.foodId, 
      table.exerciseId
    ),
  };
});

// User favorites relations
export const userFavoriteItemsRelations = relations(userFavoriteItems, ({ one }) => ({
  user: one(users, {
    fields: [userFavoriteItems.userId],
    references: [users.id],
  }),
  food: one(foods, {
    fields: [userFavoriteItems.foodId],
    references: [foods.id],
  }),
  exercise: one(exercises, {
    fields: [userFavoriteItems.exerciseId],
    references: [exercises.id],
  }),
}));

// Zod schemas for insertions - simplified
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  displayName: true,
  theme: true,
});

export const insertFoodSchema = createInsertSchema(foods);
export const insertFoodEntrySchema = createInsertSchema(foodEntries);
export const insertExerciseSchema = createInsertSchema(exercises);
export const insertExerciseEntrySchema = createInsertSchema(exerciseEntries);
export const insertWaterEntrySchema = createInsertSchema(waterEntries);
export const insertWeightEntrySchema = createInsertSchema(weightEntries);
export const insertUserFavoriteItemSchema = createInsertSchema(userFavoriteItems);

// Inferred Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Food = typeof foods.$inferSelect;
export type InsertFood = z.infer<typeof insertFoodSchema>;

export type FoodEntry = typeof foodEntries.$inferSelect;
export type InsertFoodEntry = z.infer<typeof insertFoodEntrySchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type ExerciseEntry = typeof exerciseEntries.$inferSelect;
export type InsertExerciseEntry = z.infer<typeof insertExerciseEntrySchema>;

export type WaterEntry = typeof waterEntries.$inferSelect;
export type InsertWaterEntry = z.infer<typeof insertWaterEntrySchema>;

export type WeightEntry = typeof weightEntries.$inferSelect;
export type InsertWeightEntry = z.infer<typeof insertWeightEntrySchema>;

export type UserFavoriteItem = typeof userFavoriteItems.$inferSelect;
export type InsertUserFavoriteItem = z.infer<typeof insertUserFavoriteItemSchema>;
