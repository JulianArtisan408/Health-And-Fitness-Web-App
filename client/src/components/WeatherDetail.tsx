import React, { ReactNode } from "react";

interface WeatherDetailProps {
  icon: ReactNode | string;
  label: string;
  value: string;
}

export default function WeatherDetail({ icon, label, value }: WeatherDetailProps) {
  return (
    <div className="flex flex-col items-center glass-card p-5 transition-all duration-300 hover:shadow-glow group border border-white/5 hover:border-white/15 backdrop-blur-md hover:backdrop-blur-lg rounded-xl">
      <div className="mb-4 bg-white/10 p-3 rounded-full group-hover:bg-white/15 transition-all duration-300">
        {typeof icon === 'string' ? (
          <span className="material-icons text-white/80 group-hover:text-white transition-colors">{icon}</span>
        ) : (
          <div className="transform group-hover:scale-125 transition-all duration-300 animation-pulse-glow">{icon}</div>
        )}
      </div>
      <span className="text-xs text-white/60 mb-1.5 uppercase tracking-wider font-medium">{label}</span>
      <span className="font-bold text-white/90 group-hover:text-white group-hover:scale-105 transition-all duration-300">{value}</span>
    </div>
  );
}
