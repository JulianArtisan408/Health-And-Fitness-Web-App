import React, { useState } from 'react';
import { FoodSearch } from './FoodSearch';
import { FoodJournal } from './FoodJournal';
import { AddFoodEntry } from './AddFoodEntry';
import { FoodData } from '@shared/types';

export function NutritionTab() {
  const [selectedFood, setSelectedFood] = useState<FoodData | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="bg-background/80 backdrop-blur-md p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Nutrition Tracking</h2>
          <p className="text-muted-foreground">Track your daily food intake and nutrients</p>
        </div>
      </div>
      
      {/* Main Content - Food Search and Entries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Food Search Component */}
          <FoodSearch 
            onSelectFood={(food) => setSelectedFood(food)} 
          />
          
          {/* Add Food Entry Dialog */}
          <AddFoodEntry 
            food={selectedFood}
            isOpen={selectedFood !== null}
            onClose={() => setSelectedFood(null)}
          />
        </div>
        
        <div>
          {/* Food Journal */}
          <FoodJournal
            date={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>
      </div>
    </div>
  );
}