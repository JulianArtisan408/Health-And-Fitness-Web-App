import axios from 'axios';

const USDA_API_KEY = process.env.USDA_API_KEY;
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

// Interfaces for USDA API response types
interface USDASearchResult {
  totalHits: number;
  currentPage: number;
  totalPages: number;
  foods: USDAFoodItem[];
}

interface USDAFoodItem {
  fdcId: number;
  description: string;
  dataType: string;
  publishedDate: string;
  brandName?: string;
  brandOwner?: string;
  ingredients?: string;
  foodNutrients: USDANutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
  foodPortions?: USDAFoodPortion[];
  foodCategory?: string;
}

interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
}

interface USDAFoodPortion {
  id: number;
  amount: number;
  gramWeight: number;
  measureUnit: {
    id: number;
    name: string;
  };
  modifier?: string;
}

// Interface for our simplified food data structure
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

/**
 * Search for foods in the USDA database
 * @param query Search term
 * @param pageSize Number of results to return (max 200)
 * @param pageNumber Page number for pagination
 * @returns Formatted food data
 */
export async function searchFoods(query: string, pageSize: number = 50, pageNumber: number = 1): Promise<FoodData[]> {
  try {
    console.log(`Searching USDA foods with query: "${query}", API key: ${USDA_API_KEY ? 'Available' : 'Missing'}`);
    
    if (!USDA_API_KEY) {
      throw new Error('USDA API key is not configured');
    }
    
    // Fix array parameter encoding to avoid brackets in URL
    const params = new URLSearchParams();
    params.append('api_key', USDA_API_KEY);
    params.append('query', query);
    params.append('pageSize', pageSize.toString());
    params.append('pageNumber', pageNumber.toString());
    params.append('dataType', 'SR Legacy');
    params.append('dataType', 'Survey (FNDDS)');
    params.append('dataType', 'Foundation');
    params.append('dataType', 'Branded');
    
    console.log(`Making USDA API request with key: ${USDA_API_KEY.substring(0, 5)}...`);
    const response = await axios.get<USDASearchResult>(`${BASE_URL}/foods/search`, { params });

    if (!response.data || !response.data.foods) {
      console.error('Invalid USDA API response format:', response.data);
      return [];
    }

    return response.data.foods.map(food => mapUSDAFoodToFoodData(food));
  } catch (error) {
    console.error('Error searching USDA food database:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    throw new Error('Failed to search for foods');
  }
}

/**
 * Get detailed information about a specific food item
 * @param fdcId USDA FDC ID
 * @returns Detailed food data
 */
export async function getFoodDetails(fdcId: number): Promise<FoodData> {
  try {
    console.log(`Getting USDA food details for ID: ${fdcId}, API key: ${USDA_API_KEY ? 'Available' : 'Missing'}`);
    
    if (!USDA_API_KEY) {
      throw new Error('USDA API key is not configured');
    }
    
    // Use URLSearchParams for consistent query string encoding
    const params = new URLSearchParams();
    params.append('api_key', USDA_API_KEY);
    
    const response = await axios.get<USDAFoodItem>(`${BASE_URL}/food/${fdcId}`, { params });

    if (!response.data) {
      throw new Error('Invalid USDA API response: no data returned');
    }

    return mapUSDAFoodToFoodData(response.data);
  } catch (error) {
    console.error('Error fetching food details from USDA:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    throw new Error('Failed to get food details');
  }
}

/**
 * Maps USDA food data format to our application's format
 */
function mapUSDAFoodToFoodData(usdaFood: USDAFoodItem): FoodData {
  // Find nutrient values - USDA uses specific nutrient IDs
  const calories = findNutrientValue(usdaFood.foodNutrients, 'Energy') || 0;
  const protein = findNutrientValue(usdaFood.foodNutrients, 'Protein') || 0;
  const carbs = findNutrientValue(usdaFood.foodNutrients, 'Carbohydrate, by difference') || 0;
  const fat = findNutrientValue(usdaFood.foodNutrients, 'Total lipid (fat)') || 0;
  const fiber = findNutrientValue(usdaFood.foodNutrients, 'Fiber, total dietary');
  const sugar = findNutrientValue(usdaFood.foodNutrients, 'Sugars, total including NLEA');
  
  return {
    id: usdaFood.fdcId,
    name: usdaFood.description,
    brand: usdaFood.brandOwner || usdaFood.brandName,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    sugar,
    servingSize: usdaFood.servingSize,
    servingSizeUnit: usdaFood.servingSizeUnit,
    // We could add a default image based on food category
    image: undefined
  };
}

/**
 * Helper function to find a nutrient value by name
 */
function findNutrientValue(nutrients: USDANutrient[], name: string): number | undefined {
  const nutrient = nutrients.find(n => n.nutrientName.includes(name));
  return nutrient?.value;
}