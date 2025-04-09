import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search as SearchIcon, 
  Plus as PlusIcon, 
  Info as InfoIcon,
  Loader2 as LoaderIcon 
} from "lucide-react";
import { FoodData } from "../types";
import { searchUSDAFoods } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface FoodSearchProps {
  onSelectFood: (food: FoodData) => void;
}

export function FoodSearch({ onSelectFood }: FoodSearchProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodData | null>(null);
  const { toast } = useToast();

  const {
    data: searchResults,
    isLoading,
    error,
    refetch
  } = useQuery<FoodData[]>({
    queryKey: ['/api/usda/foods/search', query],
    queryFn: () => searchUSDAFoods(query),
    enabled: false, // Don't fetch automatically, wait for user to click search
  });

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Search query is required",
        description: "Please enter a food to search for",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    await refetch();
    setIsSearching(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectFood = (food: FoodData) => {
    setSelectedFood(food);
  };

  const handleAddFood = () => {
    if (selectedFood) {
      onSelectFood(selectedFood);
      setSelectedFood(null);
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Foods</CardTitle>
          <CardDescription>Find foods from USDA database to log to your journal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search for a food item..."
                className="w-full pl-10 pr-4 py-2 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching || isLoading}>
              {isSearching || isLoading ? (
                <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <SearchIcon className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </div>

          {error ? (
            <div className="text-center p-4 text-red-500">
              Error searching foods. Please try again.
            </div>
          ) : null}

          {searchResults && searchResults.length === 0 && !isLoading ? (
            <div className="text-center p-4 text-muted-foreground">
              No foods found. Try a different search term.
            </div>
          ) : null}

          {searchResults && searchResults.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {searchResults.map((food) => (
                <div
                  key={food.id}
                  className="p-3 border rounded-md hover:bg-accent transition-colors flex justify-between items-center cursor-pointer"
                  onClick={() => handleSelectFood(food)}
                >
                  <div>
                    <h4 className="font-medium">{food.name}</h4>
                    {food.brand && (
                      <p className="text-sm text-muted-foreground">{food.brand}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{food.calories} kcal</span>
                    <Button variant="ghost" size="icon" onClick={(e) => {
                      e.stopPropagation();
                      handleSelectFood(food);
                    }}>
                      <InfoIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Food Details Dialog */}
      <Dialog open={selectedFood !== null} onOpenChange={(open) => !open && setSelectedFood(null)}>
        {selectedFood && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedFood.name}</DialogTitle>
              <DialogDescription>
                {selectedFood.brand && `By ${selectedFood.brand}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Calories</span>
                <span className="font-medium">{selectedFood.calories} kcal</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-primary/10 p-2 rounded-md text-center">
                  <div className="text-xs text-muted-foreground">Protein</div>
                  <div className="font-medium">{selectedFood.protein}g</div>
                </div>
                <div className="bg-primary/10 p-2 rounded-md text-center">
                  <div className="text-xs text-muted-foreground">Carbs</div>
                  <div className="font-medium">{selectedFood.carbs}g</div>
                </div>
                <div className="bg-primary/10 p-2 rounded-md text-center">
                  <div className="text-xs text-muted-foreground">Fat</div>
                  <div className="font-medium">{selectedFood.fat}g</div>
                </div>
              </div>
              
              <div className="space-y-1 mb-4">
                {selectedFood.fiber && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Fiber</span>
                    <span className="text-sm">{selectedFood.fiber}g</span>
                  </div>
                )}
                {selectedFood.sugar && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sugar</span>
                    <span className="text-sm">{selectedFood.sugar}g</span>
                  </div>
                )}
                {selectedFood.servingSize && selectedFood.servingSizeUnit && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Serving Size</span>
                    <span className="text-sm">{selectedFood.servingSize} {selectedFood.servingSizeUnit}</span>
                  </div>
                )}
              </div>
              
              <Badge variant="outline" className="mb-4">
                USDA Database
              </Badge>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setSelectedFood(null)} className="mr-2">
                Cancel
              </Button>
              <Button onClick={handleAddFood} className="gap-2">
                <PlusIcon className="h-4 w-4" />
                Add to Journal
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}