import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type WeatherData, type FavoriteLocation } from "@shared/schema";
import SearchBar from "./SearchBar";
import UnitToggle from "./UnitToggle";
import WeatherDisplay from "./WeatherDisplay";
import ApiKeyError from "./ApiKeyError";
import WelcomeHeader from "./WelcomeHeader";
import { lazy, Suspense } from "react";
import { AlertCircle, Star, StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load the FavoritesList component
const FavoritesList = lazy(() => import("@/components/FavoritesList"));

type TempUnit = "celsius" | "fahrenheit";

export default function Weather() {
  const [city, setCity] = useState<string>("");
  const [unit, setUnit] = useState<TempUnit>("celsius");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for favorite locations
  const { data: favorites = [], isLoading: isLoadingFavorites } = useQuery<FavoriteLocation[]>({
    queryKey: ['/api/favorites'],
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Query for weather data when city changes
  const { data, isLoading, error, refetch } = useQuery<WeatherData & { isFavorite?: boolean }>({
    queryKey: [city ? `/api/weather?city=${encodeURIComponent(city)}&unit=${unit}` : null],
    enabled: !!city,
    staleTime: 5 * 60 * 1000, // 5 minutes before refetching
    retry: 1, // Retry failed requests once
  });
  
  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (location: Partial<FavoriteLocation>) => {
      return apiRequest<any>('/api/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify(location),
        headers: {
          'Content-Type': 'application/json',
        },
      } as any);
    },
    onSuccess: (response: any) => {
      const action = response.code === "ADDED" ? "added to" : "removed from";
      toast({
        title: `${response.location.name} ${action} favorites`,
        variant: "default",
        duration: 3000, 
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({queryKey: ['/api/favorites']});
      if (city) {
        queryClient.invalidateQueries({queryKey: [`/api/weather?city=${encodeURIComponent(city)}&unit=${unit}`]});
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    },
  });
  
  // Display a toast notification for severe errors
  useEffect(() => {
    if (error && ((error as any)?.response?.status === 401 || (error as any)?.message?.includes("401"))) {
      toast({
        title: "API Key Error",
        description: "The OpenWeatherMap API key is invalid or not yet activated. New API keys may take up to 24 hours to activate after creation.",
        variant: "destructive",
        duration: 6000, // Show for 6 seconds
      });
    }
  }, [error, toast]);
  
  // Extract error message from response
  const getErrorMessage = () => {
    const errorResponse = (error as any)?.response?.data;
    if (errorResponse?.message) {
      return errorResponse.message;
    }
    
    if ((error as any)?.message?.includes("401") || (error as any)?.response?.status === 401) {
      return "API key error: The OpenWeatherMap API key is invalid or not yet activated. New API keys may take up to 24 hours to activate.";
    }
    
    if ((error as any)?.message?.includes("404")) {
      return "City not found. Please check the spelling and try again.";
    }
    
    return "Error fetching weather data. Please try again.";
  };

  const handleSearch = async (searchCity: string) => {
    if (!searchCity.trim()) return;
    
    setCity(searchCity);
    await refetch();
  };

  const handleUnitToggle = (newUnit: TempUnit) => {
    setUnit(newUnit);
    if (city) {
      refetch();
    }
  };

  const handleToggleFavorite = () => {
    if (!data || !data.location) return;
    
    toggleFavoriteMutation.mutate({
      name: data.location.name,
      country: data.location.country,
      state: data.location.state,
      lat: data.location.lat,
      lon: data.location.lon,
    });
  };

  const handleFavoriteSelect = (favorite: FavoriteLocation) => {
    handleSearch(`${favorite.name},${favorite.country}`);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      
      <div className="flex flex-wrap justify-between items-center mb-6 mt-2">
        <UnitToggle unit={unit} onToggle={handleUnitToggle} />
        
        {data && data.location && (
          <Button
            variant="outline"
            size="sm"
            className={`flex items-center gap-1 glass-card border-0 hover:shadow-glow transition-all duration-300 px-4 py-2 h-auto ${
              data.isFavorite 
              ? "bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400" 
              : "bg-white/5"
            }`}
            onClick={handleToggleFavorite}
            disabled={toggleFavoriteMutation.isPending}
          >
            {data.isFavorite ? (
              <>
                <StarOff className="h-4 w-4 mr-2 text-amber-400 animation-sparkle" /> 
                <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent font-medium">
                  Remove Favorite
                </span>
              </>
            ) : (
              <>
                <Star className="h-4 w-4 mr-2 text-amber-400 animation-sparkle" /> 
                <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent font-medium">
                  Add to Favorites
                </span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* Favorites list */}
      {!city && favorites.length > 0 && (
        <Suspense fallback={
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-amber-500 animation-pulse-glow" />
              <span className="bg-gradient-to-r from-amber-300 to-amber-100 bg-clip-text text-transparent">Your Favorite Locations</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-shimmer h-32 w-full rounded-xl animation-pulse-subtle"></div>
              ))}
            </div>
          </div>
        }>
          <FavoritesList 
            favorites={favorites} 
            onSelect={handleFavoriteSelect} 
            isLoading={isLoadingFavorites}
          />
        </Suspense>
      )}
      
      {error ? (
        ((error as any)?.response?.status === 401 || (error as any)?.message?.includes("401")) ? (
          <ApiKeyError 
            message={getErrorMessage()} 
            onRetry={() => refetch()} 
          />
        ) : (
          <div className="mt-5 p-5 glass-panel border-red-500/30 rounded-xl text-center mx-auto max-w-md shadow-lg animate-in fade-in animation-pulse-subtle">
            <div className="flex items-center justify-center mb-3">
              <AlertCircle className="mr-2 h-6 w-6 text-red-400 animation-pulse-glow" />
              <span className="font-semibold text-lg bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">Error</span>
            </div>
            <p className="text-white/80">{getErrorMessage()}</p>
          </div>
        )
      ) : !city ? (
        // Show welcome screen when no city is selected
        <WelcomeHeader onCitySelect={handleSearch} />
      ) : (
        <WeatherDisplay 
          weatherData={data} 
          isLoading={isLoading} 
          unit={unit}
        />
      )}
    </div>
  );
}
