import React from "react";
import { Sunrise, Sunset, Moon, Sun } from "lucide-react";

interface SunriseSunsetProps {
  sunrise: string;
  sunset: string;
  daytimeProgress: number;
}

export default function SunriseSunset({ 
  sunrise, 
  sunset, 
  daytimeProgress 
}: SunriseSunsetProps) {

  // Get daytime or nighttime text
  const getDaytimeStatus = () => {
    if (daytimeProgress < 1) return "Night";
    if (daytimeProgress > 99) return "Night";
    if (daytimeProgress < 25) return "Early Morning";
    if (daytimeProgress < 50) return "Morning";
    if (daytimeProgress < 75) return "Afternoon";
    return "Evening";
  };

  // Map daytime progress to determine appropriate colors
  const getTimeColors = () => {
    if (daytimeProgress < 1 || daytimeProgress > 99) {
      return {
        fromColor: "from-indigo-900/20",
        viaColor: "via-purple-800/20",
        toColor: "to-indigo-900/20",
        fromGlow: "from-indigo-500/80",
        viaGlow: "via-purple-400/80",
        toGlow: "to-indigo-500/80",
        textColor: "text-indigo-300",
        icon: <Moon className="h-5 w-5" />,
        shadowColor: "shadow-indigo-500/30",
        iconBg: "bg-indigo-500/80"
      };
    } else if (daytimeProgress < 25) {
      return {
        fromColor: "from-amber-500/20",
        viaColor: "via-orange-400/20",
        toColor: "to-rose-500/20",
        fromGlow: "from-amber-400/80",
        viaGlow: "via-orange-300/80",
        toGlow: "to-rose-400/80",
        textColor: "text-amber-300",
        icon: <Sun className="h-5 w-5" />,
        shadowColor: "shadow-amber-500/30",
        iconBg: "bg-amber-500/80"
      };
    } else if (daytimeProgress < 75) {
      return {
        fromColor: "from-sky-500/20",
        viaColor: "via-blue-400/20",
        toColor: "to-indigo-500/20",
        fromGlow: "from-sky-400/80",
        viaGlow: "via-blue-300/80",
        toGlow: "to-indigo-400/80",
        textColor: "text-sky-300",
        icon: <Sun className="h-5 w-5" />,
        shadowColor: "shadow-sky-500/30",
        iconBg: "bg-sky-500/80"
      };
    } else {
      return {
        fromColor: "from-orange-500/20",
        viaColor: "via-amber-400/20",
        toColor: "to-red-500/20",
        fromGlow: "from-orange-400/80",
        viaGlow: "via-amber-300/80",
        toGlow: "to-red-400/80",
        textColor: "text-orange-300",
        icon: <Sun className="h-5 w-5" />,
        shadowColor: "shadow-orange-500/30",
        iconBg: "bg-orange-500/80"
      };
    }
  };

  const timeColors = getTimeColors();

  return (
    <div className="mt-8 pt-8 border-t border-white/10">
      <h3 className="text-2xl font-bold mb-6 text-white/90 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent flex items-center">
        <div className="mr-2 p-2 rounded-full bg-white/10 backdrop-blur-md">
          {daytimeProgress < 1 || daytimeProgress > 99 ? 
            <Moon className="h-5 w-5 text-indigo-300" /> : 
            <Sun className="h-5 w-5 text-amber-300" />
          }
        </div>
        Sun Position
      </h3>
      
      <div className="glass-panel-intense p-8 relative overflow-hidden shadow-xl border border-white/10 backdrop-blur-xl rounded-xl">
        {/* Day/night background indicators with animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className={`absolute top-0 left-0 right-0 h-full bg-gradient-to-r ${timeColors.fromColor} ${timeColors.viaColor} ${timeColors.toColor}`} 
            style={{ clipPath: `polygon(0 0, 100% 0, 100% 100%, 0% 100%)` }}
          ></div>
          
          {/* Animated particles */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute h-2 w-2 rounded-full bg-white/20 top-[15%] left-[10%] animation-float-slow"></div>
            <div className="absolute h-1.5 w-1.5 rounded-full bg-white/20 top-[45%] left-[15%] animation-float-medium"></div>
            <div className="absolute h-1 w-1 rounded-full bg-white/20 top-[25%] left-[75%] animation-float-fast"></div>
            <div className="absolute h-2 w-2 rounded-full bg-white/20 top-[65%] left-[82%] animation-float-slow"></div>
            <div className="absolute h-1.5 w-1.5 rounded-full bg-white/20 top-[85%] left-[22%] animation-float-medium"></div>
          </div>
          
          {/* Sun/Moon journey arc path */}
          <div className="absolute top-0 left-0 w-full h-36 flex items-center justify-center overflow-hidden">
            <div className="w-[150%] h-[300px] rounded-[100%] border-2 border-dashed border-white/20 -mt-[150px] animation-rotate-slow"></div>
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="text-center mb-6">
            <span className={`inline-block px-5 py-2.5 glass-card rounded-full text-lg font-semibold ${timeColors.textColor} ${timeColors.shadowColor} border border-white/10 animation-pulse-subtle`}>
              {getDaytimeStatus()}
            </span>
          </div>
          
          <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-6 md:gap-2">
            <div className="flex flex-col items-center glass-card p-4 hover:shadow-glow transition-all duration-300 backdrop-blur-lg border border-white/10 group rounded-xl w-full md:w-auto">
              <div className="p-3 rounded-full mb-2 bg-gradient-to-r from-amber-600/30 to-yellow-500/30 group-hover:from-amber-600/40 group-hover:to-yellow-500/40 backdrop-blur-sm transition-all duration-300">
                <Sunrise className="h-6 w-6 text-amber-300 group-hover:scale-110 transition-all duration-300" />
              </div>
              <p className="text-xs uppercase tracking-wider text-white/60 mb-1.5 font-medium">Sunrise</p>
              <p className="font-bold text-white/90 group-hover:text-white transition-colors">{sunrise}</p>
            </div>
            
            <div className="relative w-full mx-0 md:mx-6 h-12 flex items-center my-2 md:my-0">
              {/* Track background with glass effect */}
              <div className="h-4 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full relative w-full overflow-hidden backdrop-blur-sm border border-white/10 shadow-inner">
                {/* Progress bar with dynamic coloring */}
                <div 
                  className={`absolute h-4 bg-gradient-to-r ${timeColors.fromGlow} ${timeColors.viaGlow} ${timeColors.toGlow} rounded-full shadow-lg`} 
                  style={{ width: `${daytimeProgress}%` }}
                ></div>
              </div>
              
              {/* Sun/Moon indicator with enhanced visual */}
              <div 
                className="absolute -translate-x-1/2 transform"
                style={{ left: `${daytimeProgress}%` }}
              >
                {daytimeProgress >= 0 && daytimeProgress <= 100 && (
                  <div className="flex flex-col items-center">
                    <div className={`h-10 w-10 rounded-full ${timeColors.iconBg} ${timeColors.shadowColor} flex items-center justify-center text-white animation-pulse-glow shadow-xl`}>
                      {timeColors.icon}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-center glass-card p-4 hover:shadow-glow transition-all duration-300 backdrop-blur-lg border border-white/10 group rounded-xl w-full md:w-auto">
              <div className="p-3 rounded-full mb-2 bg-gradient-to-r from-indigo-600/30 to-purple-500/30 group-hover:from-indigo-600/40 group-hover:to-purple-500/40 backdrop-blur-sm transition-all duration-300">
                <Sunset className="h-6 w-6 text-indigo-300 group-hover:scale-110 transition-all duration-300" />
              </div>
              <p className="text-xs uppercase tracking-wider text-white/60 mb-1.5 font-medium">Sunset</p>
              <p className="font-bold text-white/90 group-hover:text-white transition-colors">{sunset}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
