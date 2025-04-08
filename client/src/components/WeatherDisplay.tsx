import React from "react";
import { type WeatherData } from "@shared/schema";
import LocationHeader from "./LocationHeader";
import WeatherDetail from "./WeatherDetail";
import SunriseSunset from "./SunriseSunset";
import { Skeleton } from "@/components/ui/skeleton";
import { Thermometer, Droplets, Wind, Eye, Gauge, Sun } from "lucide-react";

interface WeatherDisplayProps {
  weatherData: WeatherData | undefined;
  isLoading: boolean;
  unit: "celsius" | "fahrenheit";
}

export default function WeatherDisplay({
  weatherData,
  isLoading,
  unit,
}: WeatherDisplayProps) {
  if (isLoading) {
    return (
      <div className="animate-in fade-in duration-500">
        <div className="glass-panel-intense shadow-2xl overflow-hidden relative">
          {/* Animated background effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50 rotate-45 animation-wave"></div>
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-blue-500/10 rounded-full filter blur-3xl opacity-60 animation-float-slow"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-cyan-500/10 rounded-full filter blur-3xl opacity-40 animation-float"></div>
          </div>
          
          <div className="h-24 bg-gradient-to-r from-blue-600/30 to-cyan-600/30 relative backdrop-blur-md">
            <div className="absolute inset-0 bg-black/10"></div>
            <Skeleton className="h-full w-full bg-transparent" />
          </div>
          
          <div className="p-8 md:p-10 relative">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <Skeleton className="h-24 w-24 rounded-full bg-white/10 animation-pulse-glow" />
                <div className="space-y-3">
                  <Skeleton className="h-10 w-32 bg-white/10 rounded-lg" />
                  <Skeleton className="h-5 w-40 bg-white/5 rounded-lg" />
                  <Skeleton className="h-4 w-28 bg-white/5 rounded-lg" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto mt-6 md:mt-0">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="group">
                    <Skeleton className="h-24 w-36 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl group-hover:bg-white/10 transition-all p-4" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-10">
              <Skeleton className="h-12 w-full bg-white/5 rounded-lg" />
              <div className="flex justify-between mt-4">
                <Skeleton className="h-6 w-20 bg-white/10 rounded-full" />
                <Skeleton className="h-6 w-20 bg-white/10 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full mt-3 bg-white/5 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return null; // WelcomeHeader will show instead
  }

  const { location, weather, date, time } = weatherData;

  // Determine weather background color based on temperature
  const getBgColor = (temp: number) => {
    if (unit === "celsius") {
      if (temp >= 30) return "from-orange-400 to-red-500";
      if (temp >= 20) return "from-yellow-400 to-orange-500";
      if (temp >= 10) return "from-blue-400 to-cyan-500";
      return "from-blue-600 to-indigo-600";
    } else {
      if (temp >= 86) return "from-orange-400 to-red-500";
      if (temp >= 68) return "from-yellow-400 to-orange-500";
      if (temp >= 50) return "from-blue-400 to-cyan-500";
      return "from-blue-600 to-indigo-600";
    }
  };

  // Get larger weather icon
  const getWeatherIcon = (icon: string) => {
    return `https://openweathermap.org/img/wn/${icon}@4x.png`;
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="glass-panel-intense shadow-2xl overflow-hidden backdrop-blur-xl relative">
        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50 rotate-45 animation-wave"></div>
          <div className={`absolute -bottom-16 -right-16 w-64 h-64 bg-gradient-to-br ${getBgColor(weather.temp)} rounded-full filter blur-3xl opacity-20 animation-float-slow`}></div>
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-cyan-500/10 rounded-full filter blur-3xl opacity-40 animation-float"></div>
        </div>
        
        <LocationHeader 
          location={location} 
          date={date} 
          time={time} 
        />
        
        <div className="p-8 md:p-10 relative">
          {/* Main weather display */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="relative animation-float shadow-glow rounded-full">
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getBgColor(weather.temp)} opacity-40 blur-xl scale-125`}></div>
                <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20">
                  <img 
                    src={getWeatherIcon(weather.icon)} 
                    alt={weather.description} 
                    width="130" 
                    height="130" 
                    className="relative z-10 animation-pulse-glow"
                  />
                </div>
              </div>
              <div className="ml-6">
                <div className="flex flex-col">
                  <h3 className="text-7xl font-black bg-gradient-to-br from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow">
                    {weather.temp}°<span className="text-4xl">{unit === "celsius" ? "C" : "F"}</span>
                  </h3>
                  <p className="text-white/90 capitalize text-xl mt-2 font-medium">{weather.description}</p>
                  <p className="text-white/70 text-sm mt-2 bg-white/10 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
                    Feels like {weather.feelsLike}°{unit === "celsius" ? "C" : "F"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Weather details grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 w-full md:w-auto">
              <WeatherDetail 
                icon={<Thermometer className="h-5 w-5 text-orange-400" />}
                label="Feels Like" 
                value={`${weather.feelsLike}°${unit === "celsius" ? "C" : "F"}`} 
              />
              
              <WeatherDetail 
                icon={<Droplets className="h-5 w-5 text-blue-400" />}
                label="Humidity" 
                value={`${weather.humidity}%`} 
              />
              
              <WeatherDetail 
                icon={<Wind className="h-5 w-5 text-cyan-400" />}
                label="Wind" 
                value={`${weather.wind} ${unit === "celsius" ? "km/h" : "mph"}`} 
              />
              
              <WeatherDetail 
                icon={<Eye className="h-5 w-5 text-gray-400" />}
                label="Visibility" 
                value={`${weather.visibility} km`} 
              />
              
              <WeatherDetail 
                icon={<Gauge className="h-5 w-5 text-purple-400" />}
                label="Pressure" 
                value={`${weather.pressure} hPa`} 
              />
              
              {weather.uv !== undefined ? (
                <WeatherDetail 
                  icon={<Sun className="h-5 w-5 text-amber-400" />}
                  label="UV Index" 
                  value={`${weather.uv}`} 
                />
              ) : (
                <WeatherDetail 
                  icon={<Sun className="h-5 w-5 text-amber-400" />}
                  label="UV Index" 
                  value="N/A" 
                />
              )}
            </div>
          </div>

          {/* Sunrise/Sunset visualization */}
          <div className="mt-10">
            <SunriseSunset 
              sunrise={weather.sunrise}
              sunset={weather.sunset}
              daytimeProgress={weather.daytimeProgress}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
