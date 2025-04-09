import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Theme state management
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Check if user has a theme preference stored
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Otherwise check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    // Apply theme class to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save theme preference
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen">
        {/* Theme toggle button */}
        <button 
          onClick={toggleTheme}
          className="fixed top-6 right-6 z-50 p-3 rounded-full glass-shimmer hover:glass-panel-intense transition-all duration-300 animation-pulse-glow shadow-glow"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5 text-white animation-shimmer" />
          ) : (
            <Sun className="h-5 w-5 text-amber-300 animation-shimmer" />
          )}
        </button>

        {/* Main content */}
        <div className="container mx-auto px-4 py-10 md:py-12 lg:py-14 min-h-screen relative z-10">
          <div className="glass-panel-intense p-6 md:p-8 lg:p-10 max-w-5xl mx-auto shadow-xl animation-pulse-subtle">
            <div className="relative z-10 overflow-hidden">
              <Router />
            </div>
            <div className="absolute inset-0 rounded-xl overflow-hidden -z-10">
              <div className="absolute -inset-[10px] bg-gradient-to-tr from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-30 blur-xl animation-rotate-slow"></div>
            </div>
          </div>
          <Toaster />
        </div>

        {/* Background decorative elements */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          {/* Atmospheric particles */}
          <div className="absolute inset-0 bg-[url('https://assets.codepen.io/721952/noise.png')] opacity-[0.05] mix-blend-overlay"></div>
        
          {/* Enhanced animated orbs with variety of colors and effects */}
          <div className="absolute top-[10%] right-[15%] w-[550px] h-[550px] rounded-full bg-gradient-to-br from-blue-600/15 to-blue-400/5 blur-3xl animation-float-slow animation-pulse-blue"></div>
          <div className="absolute bottom-[15%] left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-purple-600/15 to-purple-400/5 blur-3xl animation-float animation-pulse-purple"></div>
          <div className="absolute top-[35%] left-[15%] w-[450px] h-[450px] rounded-full bg-gradient-to-r from-indigo-600/15 to-indigo-400/5 blur-3xl animation-float-fast"></div>
          <div className="absolute bottom-[25%] right-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-cyan-600/15 to-cyan-400/5 blur-3xl animation-float-slow animation-pulse-cyan"></div>
          
          {/* Additional color accent orbs */}
          <div className="absolute top-[60%] left-[50%] w-[350px] h-[350px] rounded-full bg-gradient-to-r from-pink-600/15 to-pink-400/5 blur-3xl animation-float"></div>
          <div className="absolute top-[20%] left-[40%] w-[300px] h-[300px] rounded-full bg-gradient-to-r from-amber-600/15 to-amber-400/5 blur-3xl animation-float-slow"></div>
          
          {/* Enhanced light beam effects with animations */}
          <div className="absolute top-0 left-[50%] transform -translate-x-1/2 w-[350px] h-[1200px] bg-gradient-to-b from-blue-600/30 to-transparent blur-3xl opacity-25 rotate-[20deg] animation-wave"></div>
          <div className="absolute top-0 left-[30%] transform -translate-x-1/2 w-[300px] h-[1000px] bg-gradient-to-b from-purple-600/25 to-transparent blur-3xl opacity-20 rotate-[-15deg] animation-wave"></div>
          <div className="absolute top-0 right-[20%] transform w-[320px] h-[1100px] bg-gradient-to-b from-cyan-600/20 to-transparent blur-3xl opacity-20 rotate-[35deg] animation-wave"></div>
          <div className="absolute top-0 right-[40%] transform w-[250px] h-[900px] bg-gradient-to-b from-pink-600/20 to-transparent blur-3xl opacity-15 rotate-[-25deg] animation-wave"></div>
          
          {/* Enhanced star-like particles with glow effects */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 35 }).map((_, i) => (
              <div 
                key={i}
                className={`absolute rounded-full ${
                  i % 4 === 0 ? "animation-pulse-blue" : 
                  i % 4 === 1 ? "animation-pulse-purple" : 
                  i % 4 === 2 ? "animation-pulse-cyan" : 
                  "animation-pulse-glow"
                }`}
                style={{
                  width: `${1 + Math.random() * 3}px`,
                  height: `${1 + Math.random() * 3}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 7}s`,
                  background: i % 4 === 0 ? "white" : 
                             i % 4 === 1 ? "rgba(59, 130, 246, 0.9)" : 
                             i % 4 === 2 ? "rgba(147, 51, 234, 0.9)" : 
                             "rgba(34, 211, 238, 0.9)",
                  opacity: 0.6 + Math.random() * 0.4
                }}
              />
            ))}
          </div>
        </div>
      </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
