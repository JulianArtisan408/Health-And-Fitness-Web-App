import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Weather from "@/components/Weather";
import { CloudSun, CloudRain, CloudFog, CloudSnow, CloudLightning, Sunrise } from "lucide-react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  
  // Animation effect when component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans text-slate-900 dark:text-slate-100">
      {/* Animated Weather Icons Background */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-10 dark:opacity-5 z-0">
        <div className="absolute animate-float-slow top-[5%] left-[10%] text-blue-400">
          <CloudSun size={64} />
        </div>
        <div className="absolute animate-float-medium top-[15%] right-[15%] text-cyan-400">
          <CloudRain size={48} />
        </div>
        <div className="absolute animate-float-fast bottom-[20%] left-[20%] text-indigo-400">
          <CloudFog size={56} />
        </div>
        <div className="absolute animate-float-medium top-[40%] right-[25%] text-blue-300">
          <CloudSnow size={40} />
        </div>
        <div className="absolute animate-float-slow bottom-[30%] right-[10%] text-purple-400">
          <CloudLightning size={52} />
        </div>
        <div className="absolute animate-float-fast top-[60%] left-[15%] text-amber-400">
          <Sunrise size={44} />
        </div>
      </div>

      <div 
        className={`container mx-auto px-4 py-8 max-w-5xl relative z-10 transition-all duration-1000 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <header className="text-center mb-8 transition-all duration-700 ease-in-out transform hover:scale-105">
          <div className="inline-block">
            <h1 className="text-6xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">
              WeatherNow
            </h1>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"></div>
          </div>
          <p className="text-slate-600 dark:text-slate-300 mt-3 text-lg max-w-lg mx-auto">
            Real-time weather information and forecasts with beautiful visualizations
          </p>
        </header>
        
        {/* Main content with staggered animation */}
        <div 
          className={`transition-all duration-1000 delay-300 ease-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Weather />
        </div>
        
        <footer 
          className={`mt-12 text-center text-slate-500 dark:text-slate-400 text-sm transition-all duration-1000 delay-500 ease-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p>
            Powered by{" "}
            <a 
              href="https://openweathermap.org" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              OpenWeatherMap
            </a>
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} WeatherNow. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
