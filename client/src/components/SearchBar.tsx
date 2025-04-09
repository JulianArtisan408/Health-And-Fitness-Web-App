import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Loader2, Navigation, History, Globe, TrendingUp } from "lucide-react";
import { Command, CommandGroup, CommandItem, CommandList, CommandInput } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

// Enhanced popular cities with countries
const popularCities = [
  { name: "New York", country: "USA", trending: true },
  { name: "London", country: "UK", trending: true },
  { name: "Tokyo", country: "Japan", trending: false },
  { name: "Paris", country: "France", trending: true },
  { name: "Sydney", country: "Australia", trending: false },
  { name: "Dubai", country: "UAE", trending: false },
  { name: "Singapore", country: "Singapore", trending: true },
  { name: "Rome", country: "Italy", trending: false },
  { name: "Berlin", country: "Germany", trending: false },
  { name: "Barcelona", country: "Spain", trending: false },
  { name: "Mumbai", country: "India", trending: false },
  { name: "Rio de Janeiro", country: "Brazil", trending: false }
];

interface SearchBarProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed);
        }
      } catch (e) {
        console.error("Failed to parse recent searches:", e);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveSearch = (city: string) => {
    const updatedSearches = [
      city,
      ...recentSearches.filter(item => item !== city)
    ].slice(0, 5); // Keep only the 5 most recent
    
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  const handleSearch = (city: string) => {
    if (city.trim()) {
      onSearch(city);
      saveSearch(city);
      setSearchValue(city);
      setOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchValue);
  };

  // This would be implemented with geolocation API in the future
  const handleUseLocation = () => {
    setShowLocationPrompt(false);
    // Mock a London search for demo purposes
    setTimeout(() => {
      handleSearch("London");
    }, 500);
  };

  // Filter cities based on search input
  const filteredCities = popularCities.filter(city => 
    city.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    city.country.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="relative mx-auto max-w-3xl w-full z-20">
      {/* Animated search bar container with enhanced glass effect */}
      <div className="relative backdrop-blur-xl mb-8 transition-all duration-300 transform hover:scale-[1.01] rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/25 to-pink-500/30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        
        <Popover open={open && !isLoading} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="flex items-center justify-center relative">
              <form onSubmit={handleSubmit} className="relative w-full">
                <div className="relative shadow-xl rounded-xl overflow-hidden cursor-text" onClick={() => setOpen(true)}>
                  <Input
                    type="text"
                    placeholder="Search for any city in the world..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="w-full py-7 pl-12 pr-12 glass-input focus-visible:glass-panel-intense rounded-xl border-white/15 focus-visible:ring-2 focus-visible:ring-blue-400/60 text-lg text-white placeholder:text-white/70 shadow-inner shadow-white/5"
                    disabled={isLoading}
                    autoComplete="off"
                    onFocus={() => setOpen(true)}
                    // Allow clicks to focus and open dropdown
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen(true);
                      (e.target as HTMLInputElement).focus();
                    }}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-white">
                    <MapPin className="h-6 w-6" />
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 glass-button bg-gradient-to-r from-blue-600/80 to-blue-500/80 hover:from-blue-700/90 hover:to-blue-600/90 text-white rounded-lg p-2 shadow-lg transition-all hover:shadow-blue-400/40 hover:shadow-xl border-blue-400/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </div>
          </PopoverTrigger>
          
          <PopoverContent align="center" className="w-[calc(100%-2rem)] max-w-3xl p-0 border-none rounded-2xl shadow-2xl glass-panel-intense shadow-blue-glow" sideOffset={8}>
            <Command className="rounded-lg border-none bg-transparent">
              <div className="relative px-4 pt-4 pb-2">
                <CommandInput 
                  placeholder="Type a city name..." 
                  className="glass-input border-white/20 rounded-lg text-white placeholder:text-white/60 py-6 shadow-inner pl-10 pr-4 text-lg focus:ring-2 focus:ring-blue-400/50 transition-all" 
                  value={searchValue}
                  onValueChange={setSearchValue}
                  autoFocus
                />
                <Search className="h-5 w-5 text-white/70 absolute left-8 top-[38px]" />
              </div>
              
              <CommandList className="max-h-[450px] overflow-y-auto p-4 pt-2">
                {showLocationPrompt && (
                  <div className="mb-5 glass-card p-5 rounded-lg border border-blue-400/20 flex items-center justify-between shadow-glow">
                    <div className="flex items-center">
                      <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                        <Navigation className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white mb-1">Use your current location</p>
                        <p className="text-xs text-white/70">Get weather for where you are right now</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="glass-button bg-gradient-to-r from-blue-600/70 to-blue-500/70 hover:from-blue-700/80 hover:to-blue-600/80 text-white py-2 px-4 shadow-lg hover:shadow-blue-500/40 rounded-lg border-blue-400/30 shadow-blue-glow"
                      onClick={handleUseLocation}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Locate Me
                    </Button>
                  </div>
                )}
                
                {recentSearches.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <History className="h-5 w-5 mr-2 text-blue-400" />
                        <h3 className="text-white/90 font-bold">Recent Searches</h3>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {recentSearches.map((city) => (
                        <CommandItem
                          key={`recent-${city}`}
                          onSelect={() => handleSearch(city)}
                          className="cursor-pointer glass-card hover:bg-white/10 rounded-lg transition-all px-4 py-3 group"
                        >
                          <div className="flex items-center">
                            <div className="bg-white/10 group-hover:bg-blue-500/20 p-2 rounded-full mr-3 transition-colors shadow-glow">
                              <Search className="h-4 w-4 text-white/70 group-hover:text-blue-400 transition-colors" />
                            </div>
                            <span className="font-medium text-white group-hover:text-blue-300 transition-all">{city}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 mr-2 text-blue-400" />
                      <h3 className="text-white/90 font-bold">Popular Cities</h3>
                    </div>
                    <span className="text-xs text-blue-400/80 px-2 py-1 bg-blue-400/10 rounded-full">
                      {filteredCities.length} cities
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredCities.map((city) => (
                      <CommandItem
                        key={`popular-${city.name}`}
                        onSelect={() => handleSearch(city.name)}
                        className="cursor-pointer glass-card hover:bg-white/10 rounded-lg transition-all px-4 py-3 group"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <div className="bg-white/10 group-hover:bg-blue-500/20 p-2 rounded-full mr-3 transition-colors shadow-glow">
                              <MapPin className="h-4 w-4 text-white/70 group-hover:text-blue-400 transition-colors" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-white group-hover:text-blue-300 transition-all">{city.name}</span>
                              <span className="text-xs text-white/60 group-hover:text-white/80 transition-all">{city.country}</span>
                            </div>
                          </div>
                          {city.trending && (
                            <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px] flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </div>
                </div>
                
                {searchValue && filteredCities.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="bg-blue-500/20 p-4 rounded-full mb-4">
                      <Search className="h-8 w-8 text-blue-400" />
                    </div>
                    <p className="text-white font-medium mb-1">No matching cities found</p>
                    <p className="text-white/60 text-sm text-center max-w-md">
                      Try searching for a different city or check your spelling
                    </p>
                    <Button
                      className="mt-4 glass-button bg-gradient-to-r from-blue-600/70 to-blue-500/70 hover:from-blue-700/80 hover:to-blue-600/80 text-white shadow-lg border-blue-400/20"
                      onClick={() => {
                        if (searchValue.trim()) {
                          handleSearch(searchValue);
                        }
                      }}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search for "{searchValue}"
                    </Button>
                  </div>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
