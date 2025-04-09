import React from "react";
import { FavoriteLocation } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, ArrowRight, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FavoritesListProps {
  favorites: FavoriteLocation[];
  onSelect: (favorite: FavoriteLocation) => void;
  isLoading: boolean;
}

export default function FavoritesList({ favorites, onSelect, isLoading }: FavoritesListProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (favoriteId: string) => {
      return apiRequest<any>(`/api/favorites/${favoriteId}`, {
        method: 'DELETE',
      } as any);
    },
    onSuccess: (_, favoriteId) => {
      toast({
        title: "Location removed from favorites",
        variant: "default",
        duration: 3000,
      });
      
      // Invalidate the favorites query to refresh the list
      queryClient.invalidateQueries({queryKey: ['/api/favorites']});
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove location from favorites. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-5 flex items-center drop-shadow">
          <Star className="h-5 w-5 mr-2 text-amber-400 animation-sparkle" />
          <span className="bg-gradient-to-r from-amber-300 to-amber-100 bg-clip-text text-transparent">
            Your Favorite Locations
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`glass-shimmer p-5 rounded-xl ${
                i % 3 === 0 ? "animation-float shadow-blue-glow" : 
                i % 3 === 1 ? "animation-float-medium shadow-purple-glow" : 
                "animation-float-slow shadow-cyan-glow"
              }`}
            >
              <div className={`h-6 w-32 mb-2 rounded-md bg-gradient-to-r ${
                i % 3 === 0 ? "from-blue-300/20 to-blue-100/10" : 
                i % 3 === 1 ? "from-purple-300/20 to-purple-100/10" : 
                "from-cyan-300/20 to-cyan-100/10"
              } animation-shimmer`} />
              <div className="h-4 w-24 mb-5 rounded-md bg-white/10 animation-shimmer" />
              <div className="flex justify-between">
                <div className={`h-9 w-24 rounded-md ${
                  i % 3 === 0 ? "bg-blue-400/10" : 
                  i % 3 === 1 ? "bg-purple-400/10" : 
                  "bg-cyan-400/10"
                } animation-shimmer`} />
                <div className="h-9 w-9 rounded-md bg-red-400/10 animation-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return null;
  }

  const handleDelete = (
    e: React.MouseEvent<HTMLButtonElement>,
    favoriteId: string | undefined
  ) => {
    e.stopPropagation();
    if (!favoriteId) return;
    deleteMutation.mutate(favoriteId);
  };

  return (
    <div className="mb-8 transition-all duration-300 ease-in-out">
      <h2 className="text-xl font-semibold mb-5 flex items-center drop-shadow">
        <Star className="h-5 w-5 mr-2 text-amber-400 animation-sparkle" />
        <span className="bg-gradient-to-r from-amber-300 to-amber-100 bg-clip-text text-transparent">
          Your Favorite Locations
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {favorites.map((favorite, index) => (
          <div 
            key={favorite.id} 
            className={`glass-shimmer cursor-pointer transition-all duration-300 hover:scale-[1.03] p-5 group ${
              index % 3 === 0 ? "animation-float hover:shadow-blue-glow" : 
              index % 3 === 1 ? "animation-float-medium hover:shadow-purple-glow" : 
              "animation-float-slow hover:shadow-cyan-glow"
            }`}
            onClick={() => onSelect(favorite)}
          >
            <div className="font-semibold text-lg mb-2 flex items-center">
              <MapPin className={`h-4 w-4 mr-2 ${
                index % 3 === 0 ? "text-blue-400 animation-pulse-blue" : 
                index % 3 === 1 ? "text-purple-400 animation-pulse-purple" : 
                "text-cyan-400 animation-pulse-cyan"
              }`} />
              <span className={`bg-gradient-to-r ${
                index % 3 === 0 ? "from-blue-300 to-blue-100" : 
                index % 3 === 1 ? "from-purple-300 to-purple-100" : 
                "from-cyan-300 to-cyan-100"
              } bg-clip-text text-transparent`}>
                {favorite.name}
              </span>
            </div>
            <div className="text-sm text-white/70 mb-5">
              {favorite.country} {favorite.state ? `, ${favorite.state}` : ''}
            </div>
            <div className="flex justify-between items-center">
              <Button 
                variant="outline" 
                size="sm" 
                className={`text-xs flex items-center glass-button border-0 ${
                  index % 3 === 0 ? "text-blue-300 hover:shadow-blue-glow" : 
                  index % 3 === 1 ? "text-purple-300 hover:shadow-purple-glow" : 
                  "text-cyan-300 hover:shadow-cyan-glow"
                } transition-all animation-shimmer`}
              >
                View Weather <ArrowRight className="ml-1 h-3 w-3 animation-pulse-subtle" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 glass-button text-red-400 hover:text-red-300 border-0 opacity-80 group-hover:opacity-100 hover:shadow-glow"
                onClick={(e) => handleDelete(e, favorite.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && deleteMutation.variables === favorite.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 animation-pulse-subtle" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}