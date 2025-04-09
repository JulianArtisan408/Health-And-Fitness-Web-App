import React from 'react';
import { CloudSun, Search, Compass, Map, Navigation, Cloud, Wind, Umbrella } from 'lucide-react';
import { Button } from '@/components/ui/button';

const popularCities = [
  { name: "New York", icon: <Navigation size={14} className="mr-1" /> },
  { name: "London", icon: <Umbrella size={14} className="mr-1" /> },
  { name: "Tokyo", icon: <Cloud size={14} className="mr-1" /> },
  { name: "Paris", icon: <Wind size={14} className="mr-1" /> }
];

interface WelcomeHeaderProps {
  onCitySelect?: (city: string) => void;
}

export default function WelcomeHeader({ onCitySelect }: WelcomeHeaderProps) {
  return (
    <div className="animate-in fade-in duration-700 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200 dark:bg-blue-900/30 rounded-full filter blur-3xl opacity-30"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-200 dark:bg-cyan-900/30 rounded-full filter blur-3xl opacity-30"></div>
          
          {/* Content container */}
          <div className="relative glass-panel-intense backdrop-blur-xl shadow-2xl p-10 border border-white/10 overflow-hidden">
            {/* Logo section */}
            <div className="flex justify-center mb-8">
              <div className="relative animation-float">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/40 to-cyan-300/40 rounded-full filter blur-xl opacity-50 scale-150 animation-pulse-glow"></div>
                <div className="relative bg-gradient-to-r from-blue-500/80 to-cyan-400/80 p-6 rounded-full shadow-lg backdrop-blur-md">
                  <CloudSun size={64} className="text-white animation-pulse-glow" />
                </div>
              </div>
            </div>
            
            {/* Title and description */}
            <div className="text-center mb-10">
              <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-white via-blue-100 to-white text-transparent bg-clip-text animation-float-slow">
                Weather Forecast App
              </h1>
              <p className="text-white/80 max-w-md mx-auto text-lg">
                Your personal weather assistant for accurate forecasts anywhere in the world.
              </p>
            </div>
            
            {/* Features section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              <div className="glass-card p-5 rounded-xl border-blue-400/20 group hover:border-blue-400/30 transition-all duration-300">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg mr-3 backdrop-blur-sm group-hover:bg-blue-500/30 transition-colors duration-300">
                    <Search className="text-blue-400" size={22} />
                  </div>
                  <h3 className="font-bold text-white/90 group-hover:text-white transition-colors">Search Any City</h3>
                </div>
                <p className="text-white/70 group-hover:text-white/80 transition-colors">Get real-time weather updates for any location worldwide.</p>
              </div>
              
              <div className="glass-card p-5 rounded-xl border-cyan-400/20 group hover:border-cyan-400/30 transition-all duration-300">
                <div className="flex items-center mb-3">
                  <div className="bg-cyan-500/20 p-2 rounded-lg mr-3 backdrop-blur-sm group-hover:bg-cyan-500/30 transition-colors duration-300">
                    <Compass className="text-cyan-400" size={22} />
                  </div>
                  <h3 className="font-bold text-white/90 group-hover:text-white transition-colors">Detailed Forecasts</h3>
                </div>
                <p className="text-white/70 group-hover:text-white/80 transition-colors">View temperature, humidity, wind, and atmospheric conditions.</p>
              </div>
              
              <div className="glass-card p-5 rounded-xl border-indigo-400/20 group hover:border-indigo-400/30 transition-all duration-300">
                <div className="flex items-center mb-3">
                  <div className="bg-indigo-500/20 p-2 rounded-lg mr-3 backdrop-blur-sm group-hover:bg-indigo-500/30 transition-colors duration-300">
                    <Map className="text-indigo-400" size={22} />
                  </div>
                  <h3 className="font-bold text-white/90 group-hover:text-white transition-colors">Global Coverage</h3>
                </div>
                <p className="text-white/70 group-hover:text-white/80 transition-colors">Access weather data for cities and towns across the globe.</p>
              </div>
            </div>
            
            {/* Popular cities */}
            {onCitySelect && (
              <div className="text-center">
                <p className="text-md text-white/70 mb-4 bg-gradient-to-r from-transparent via-white/20 to-transparent py-2">Popular cities</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {popularCities.map(city => (
                    <Button 
                      key={city.name}
                      variant="outline" 
                      size="sm"
                      className="glass-card border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white/90 hover:text-white px-4 py-2 h-auto transition-all duration-300 hover:shadow-glow"
                      onClick={() => onCitySelect(city.name)}
                    >
                      {city.icon}
                      <span className="ml-1">{city.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}