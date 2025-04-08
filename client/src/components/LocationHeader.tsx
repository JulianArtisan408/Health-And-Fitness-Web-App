import React from "react";
import { WeatherData } from "@shared/schema";
import { MapPin, Calendar, Clock } from "lucide-react";

interface LocationHeaderProps {
  location: WeatherData['location'];
  date: string;
  time: string;
}

export default function LocationHeader({ location, date, time }: LocationHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600/30 via-purple-600/20 to-cyan-500/30 backdrop-blur-xl text-white px-8 py-8 border-b border-white/10 shadow-inner relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/5 to-cyan-500/5 opacity-70"></div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-400/10 rounded-full filter blur-xl opacity-80 animation-float-slow"></div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative">
        <div className="flex items-center group">
          <div className="relative">
            <div className="bg-blue-500/20 p-4 rounded-full mr-4 backdrop-blur-md shadow-glow group-hover:bg-blue-500/30 transition-all duration-300">
              <MapPin className="h-7 w-7 text-white relative z-10 animation-pulse-glow" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-black bg-gradient-to-br from-white via-blue-100 to-white bg-clip-text text-transparent animation-float-slow">
              {location.name}
            </h2>
            <div className="flex items-center mt-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full inline-block">
              <p className="text-sm text-white/90 font-medium">{location.country}</p>
              {location.state && (
                <>
                  <span className="mx-2 text-white/40">|</span>
                  <p className="text-sm text-white/90 font-medium">{location.state}</p>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-3 md:mt-0">
          <div className="flex items-center glass-card px-4 py-2.5 transition-all duration-300 hover:shadow-glow border border-white/10 group">
            <div className="bg-white/10 p-2 rounded-full mr-2 group-hover:bg-white/20 transition-colors">
              <Calendar className="h-4 w-4 text-white/80 group-hover:text-white transition-colors" />
            </div>
            <p className="text-sm font-medium">{date}</p>
          </div>
          <div className="flex items-center glass-card px-4 py-2.5 transition-all duration-300 hover:shadow-glow border border-white/10 group">
            <div className="bg-white/10 p-2 rounded-full mr-2 group-hover:bg-white/20 transition-colors">
              <Clock className="h-4 w-4 text-white/80 group-hover:text-white transition-colors" />
            </div>
            <p className="text-sm font-medium">{time}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
