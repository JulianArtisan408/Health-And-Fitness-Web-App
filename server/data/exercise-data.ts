import { InsertExercise } from '@shared/schema';

// Exercise categories
export const exerciseCategories = [
  'cardio',
  'strength',
  'flexibility',
  'balance',
  'sports',
  'upper body',
  'lower body',
  'core',
  'full body',
  'hiit'
];

// Calorie burn estimation model by intensity
export const caloriesByIntensity = {
  low: { min: 2, max: 5 },
  medium: { min: 5, max: 8 },
  high: { min: 8, max: 14 }
};

// Calorie burn multipliers based on category
export const categoryMultipliers = {
  'cardio': 1.2,
  'strength': 0.9,
  'flexibility': 0.6,
  'balance': 0.5,
  'sports': 1.1,
  'upper body': 0.8,
  'lower body': 1.0,
  'core': 0.7,
  'full body': 1.1,
  'hiit': 1.3
};

// Function to calculate estimated calorie burn per minute
export function calculateCaloriesBurn(category: string, intensity: 'low' | 'medium' | 'high'): number {
  const intensityRange = caloriesByIntensity[intensity];
  const categoryKey = category.toLowerCase() as keyof typeof categoryMultipliers;
  const multiplier = categoryMultipliers[categoryKey] || 1.0;
  const baseCalories = (intensityRange.min + intensityRange.max) / 2;
  return parseFloat((baseCalories * multiplier).toFixed(1));
}

// Pre-defined exercises database
export const exercises: InsertExercise[] = [
  // Cardio exercises
  {
    name: 'Running',
    category: 'cardio',
    caloriesBurnedPerMinute: calculateCaloriesBurn('cardio', 'medium'),
    description: 'Running or jogging at a steady pace',
    isUserCreated: false
  },
  {
    name: 'Sprinting',
    category: 'cardio',
    caloriesBurnedPerMinute: calculateCaloriesBurn('cardio', 'high'),
    description: 'High-intensity running at maximum effort',
    isUserCreated: false
  },
  {
    name: 'Walking',
    category: 'cardio',
    caloriesBurnedPerMinute: calculateCaloriesBurn('cardio', 'low'),
    description: 'Brisk walking at a moderate pace',
    isUserCreated: false
  },
  {
    name: 'Cycling',
    category: 'cardio',
    caloriesBurnedPerMinute: calculateCaloriesBurn('cardio', 'medium'),
    description: 'Riding a bicycle at a moderate pace',
    isUserCreated: false
  },
  {
    name: 'Jump Rope',
    category: 'cardio',
    caloriesBurnedPerMinute: calculateCaloriesBurn('cardio', 'high'),
    description: 'Skipping rope at a fast pace',
    isUserCreated: false
  },
  {
    name: 'Swimming',
    category: 'cardio',
    caloriesBurnedPerMinute: calculateCaloriesBurn('cardio', 'medium'),
    description: 'Swimming laps at a moderate pace',
    isUserCreated: false
  },
  {
    name: 'Elliptical',
    category: 'cardio',
    caloriesBurnedPerMinute: calculateCaloriesBurn('cardio', 'medium'),
    description: 'Using an elliptical machine at a moderate resistance',
    isUserCreated: false
  },
  {
    name: 'Stair Climbing',
    category: 'cardio',
    caloriesBurnedPerMinute: calculateCaloriesBurn('cardio', 'high'),
    description: 'Climbing stairs or using a stair machine',
    isUserCreated: false
  },
  {
    name: 'Rowing',
    category: 'cardio',
    caloriesBurnedPerMinute: calculateCaloriesBurn('cardio', 'medium'),
    description: 'Using a rowing machine at a moderate resistance',
    isUserCreated: false
  },
  {
    name: 'Dancing',
    category: 'cardio',
    caloriesBurnedPerMinute: calculateCaloriesBurn('cardio', 'medium'),
    description: 'Energetic dancing',
    isUserCreated: false
  },

  // Strength exercises
  {
    name: 'Push-ups',
    category: 'upper body',
    caloriesBurnedPerMinute: calculateCaloriesBurn('upper body', 'medium'),
    description: 'Standard push-ups working chest, shoulders, and triceps',
    isUserCreated: false
  },
  {
    name: 'Pull-ups',
    category: 'upper body',
    caloriesBurnedPerMinute: calculateCaloriesBurn('upper body', 'high'),
    description: 'Pull-ups targeting back and biceps',
    isUserCreated: false
  },
  {
    name: 'Squats',
    category: 'lower body',
    caloriesBurnedPerMinute: calculateCaloriesBurn('lower body', 'medium'),
    description: 'Bodyweight or weighted squats targeting quads, hamstrings, and glutes',
    isUserCreated: false
  },
  {
    name: 'Lunges',
    category: 'lower body',
    caloriesBurnedPerMinute: calculateCaloriesBurn('lower body', 'medium'),
    description: 'Forward, reverse, or side lunges working legs and glutes',
    isUserCreated: false
  },
  {
    name: 'Deadlifts',
    category: 'full body',
    caloriesBurnedPerMinute: calculateCaloriesBurn('full body', 'high'),
    description: 'Compound exercise working back, legs, and core',
    isUserCreated: false
  },
  {
    name: 'Bench Press',
    category: 'upper body',
    caloriesBurnedPerMinute: calculateCaloriesBurn('upper body', 'medium'),
    description: 'Chest, shoulder, and triceps exercise with barbell or dumbbells',
    isUserCreated: false
  },
  {
    name: 'Shoulder Press',
    category: 'upper body',
    caloriesBurnedPerMinute: calculateCaloriesBurn('upper body', 'medium'),
    description: 'Overhead pressing with barbell or dumbbells for shoulders',
    isUserCreated: false
  },
  {
    name: 'Bicep Curls',
    category: 'upper body',
    caloriesBurnedPerMinute: calculateCaloriesBurn('upper body', 'low'),
    description: 'Isolation exercise for biceps using dumbbells or barbell',
    isUserCreated: false
  },
  {
    name: 'Tricep Extensions',
    category: 'upper body',
    caloriesBurnedPerMinute: calculateCaloriesBurn('upper body', 'low'),
    description: 'Isolation exercise for triceps using dumbbells or cable',
    isUserCreated: false
  },
  {
    name: 'Calf Raises',
    category: 'lower body',
    caloriesBurnedPerMinute: calculateCaloriesBurn('lower body', 'low'),
    description: 'Standing or seated calf raises for lower leg development',
    isUserCreated: false
  },

  // Core exercises
  {
    name: 'Planks',
    category: 'core',
    caloriesBurnedPerMinute: calculateCaloriesBurn('core', 'medium'),
    description: 'Static hold exercise for core stability',
    isUserCreated: false
  },
  {
    name: 'Crunches',
    category: 'core',
    caloriesBurnedPerMinute: calculateCaloriesBurn('core', 'medium'),
    description: 'Basic abdominal exercise targeting upper abs',
    isUserCreated: false
  },
  {
    name: 'Russian Twists',
    category: 'core',
    caloriesBurnedPerMinute: calculateCaloriesBurn('core', 'medium'),
    description: 'Rotational exercise for obliques',
    isUserCreated: false
  },
  {
    name: 'Leg Raises',
    category: 'core',
    caloriesBurnedPerMinute: calculateCaloriesBurn('core', 'medium'),
    description: 'Lower abdominal exercise performed lying on back',
    isUserCreated: false
  },
  {
    name: 'Mountain Climbers',
    category: 'core',
    caloriesBurnedPerMinute: calculateCaloriesBurn('core', 'high'),
    description: 'Dynamic core exercise that also elevates heart rate',
    isUserCreated: false
  },

  // Flexibility exercises
  {
    name: 'Yoga',
    category: 'flexibility',
    caloriesBurnedPerMinute: calculateCaloriesBurn('flexibility', 'low'),
    description: 'Various yoga poses and flows for flexibility and strength',
    isUserCreated: false
  },
  {
    name: 'Stretching',
    category: 'flexibility',
    caloriesBurnedPerMinute: calculateCaloriesBurn('flexibility', 'low'),
    description: 'General stretching routine for improved flexibility',
    isUserCreated: false
  },
  {
    name: 'Pilates',
    category: 'flexibility',
    caloriesBurnedPerMinute: calculateCaloriesBurn('flexibility', 'medium'),
    description: 'Core-focused exercise method emphasizing control and precision',
    isUserCreated: false
  },

  // HIIT exercises
  {
    name: 'Burpees',
    category: 'hiit',
    caloriesBurnedPerMinute: calculateCaloriesBurn('hiit', 'high'),
    description: 'Full body exercise combining squat, push-up, and jump',
    isUserCreated: false
  },
  {
    name: 'Box Jumps',
    category: 'hiit',
    caloriesBurnedPerMinute: calculateCaloriesBurn('hiit', 'high'),
    description: 'Plyometric exercise jumping onto an elevated platform',
    isUserCreated: false
  },
  {
    name: 'Kettlebell Swings',
    category: 'hiit',
    caloriesBurnedPerMinute: calculateCaloriesBurn('hiit', 'high'),
    description: 'Dynamic exercise using a kettlebell for power and conditioning',
    isUserCreated: false
  },
  {
    name: 'Battle Ropes',
    category: 'hiit',
    caloriesBurnedPerMinute: calculateCaloriesBurn('hiit', 'high'),
    description: 'Upper body conditioning using heavy ropes',
    isUserCreated: false
  },
  {
    name: 'Medicine Ball Slams',
    category: 'hiit',
    caloriesBurnedPerMinute: calculateCaloriesBurn('hiit', 'high'),
    description: 'Explosive exercise slamming a weighted ball to the ground',
    isUserCreated: false
  },

  // Sports
  {
    name: 'Basketball',
    category: 'sports',
    caloriesBurnedPerMinute: calculateCaloriesBurn('sports', 'high'),
    description: 'Playing full-court basketball game',
    isUserCreated: false
  },
  {
    name: 'Soccer',
    category: 'sports',
    caloriesBurnedPerMinute: calculateCaloriesBurn('sports', 'high'),
    description: 'Playing soccer match or practice',
    isUserCreated: false
  },
  {
    name: 'Tennis',
    category: 'sports',
    caloriesBurnedPerMinute: calculateCaloriesBurn('sports', 'medium'),
    description: 'Playing singles or doubles tennis',
    isUserCreated: false
  },
  {
    name: 'Volleyball',
    category: 'sports',
    caloriesBurnedPerMinute: calculateCaloriesBurn('sports', 'medium'),
    description: 'Playing indoor or beach volleyball',
    isUserCreated: false
  },
  {
    name: 'Golf (walking)',
    category: 'sports',
    caloriesBurnedPerMinute: calculateCaloriesBurn('sports', 'low'),
    description: 'Playing golf while walking the course (no cart)',
    isUserCreated: false
  },
  {
    name: 'Badminton',
    category: 'sports',
    caloriesBurnedPerMinute: calculateCaloriesBurn('sports', 'medium'),
    description: 'Playing badminton singles or doubles',
    isUserCreated: false
  },
  {
    name: 'Table Tennis',
    category: 'sports',
    caloriesBurnedPerMinute: calculateCaloriesBurn('sports', 'medium'),
    description: 'Playing ping pong or table tennis',
    isUserCreated: false
  },
  {
    name: 'Hockey',
    category: 'sports',
    caloriesBurnedPerMinute: calculateCaloriesBurn('sports', 'high'),
    description: 'Playing ice hockey or field hockey',
    isUserCreated: false
  },

  // Balance exercises
  {
    name: 'Tai Chi',
    category: 'balance',
    caloriesBurnedPerMinute: calculateCaloriesBurn('balance', 'low'),
    description: 'Slow, flowing movements focusing on balance and breathing',
    isUserCreated: false
  },
  {
    name: 'Balance Board',
    category: 'balance',
    caloriesBurnedPerMinute: calculateCaloriesBurn('balance', 'low'),
    description: 'Exercises performed on a wobble or balance board',
    isUserCreated: false
  },
  {
    name: 'Single-Leg Exercises',
    category: 'balance',
    caloriesBurnedPerMinute: calculateCaloriesBurn('balance', 'medium'),
    description: 'Various exercises performed standing on one leg',
    isUserCreated: false
  }
];