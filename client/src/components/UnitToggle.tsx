import React from "react";
import { Thermometer, ThermometerSnowflake, ThermometerSun } from "lucide-react";

interface UnitToggleProps {
  unit: "celsius" | "fahrenheit";
  onToggle: (unit: "celsius" | "fahrenheit") => void;
}

export default function UnitToggle({ unit, onToggle }: UnitToggleProps) {
  return (
    <div className="flex justify-center mb-6">
      <div className="bg-white dark:bg-slate-800 shadow-lg inline-flex rounded-full p-1 border border-gray-100 dark:border-slate-700">
        <button
          type="button"
          className={`flex items-center py-2 px-4 rounded-full transition-all ${
            unit === "celsius"
              ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium shadow-md"
              : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
          }`}
          onClick={() => onToggle("celsius")}
          aria-label="Switch to Celsius"
        >
          <ThermometerSnowflake size={16} className="mr-1" />
          <span>°C</span>
        </button>
        <button
          type="button"
          className={`flex items-center py-2 px-4 rounded-full transition-all ${
            unit === "fahrenheit"
              ? "bg-gradient-to-r from-amber-500 to-orange-400 text-white font-medium shadow-md"
              : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
          }`}
          onClick={() => onToggle("fahrenheit")}
          aria-label="Switch to Fahrenheit"
        >
          <ThermometerSun size={16} className="mr-1" />
          <span>°F</span>
        </button>
      </div>
    </div>
  );
}
