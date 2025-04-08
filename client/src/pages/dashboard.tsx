import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CalendarIcon, 
  TrendingUpIcon, 
  UtensilsIcon, 
  DropletIcon, 
  DumbbellIcon, 
  UserIcon, 
  LogOutIcon,
  BrainIcon,
  PlusIcon
} from "lucide-react";
import { NutritionTab } from "@/components/NutritionTab";
import { ExerciseTab } from "@/components/ExerciseTab";
import { WaterTab } from "@/components/WaterTab";
import { MentalTab } from "@/components/MentalTab";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Background images for each tab
  const backgroundImages = {
    overview: "https://images.unsplash.com/photo-1505279340786-1e3b097e227a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    nutrition: "https://plus.unsplash.com/premium_photo-1692193552822-88280bed64e2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    exercise: "https://images.unsplash.com/photo-1649888254873-d9870ee286ee?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    water: "https://images.unsplash.com/photo-1690887429499-df64ee03a711?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    mental: "https://images.unsplash.com/photo-1500099817043-86d46000d58f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  };

  return (
    <div className="relative">
      {/* Background image layer */}
      <div 
        style={{ 
          backgroundImage: `url(${backgroundImages[activeTab as keyof typeof backgroundImages] || ""})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -2
        }}
      />
      
      {/* Overlay layer - dark overlay without blur */}
      <div 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: -1 
        }}
      />
      
      {/* Content layer */}
      <div className="min-h-screen relative z-0">
        <div className="container mx-auto py-8 px-4 space-y-8">
          {/* Header with welcome message and logout */}
          <div className="flex justify-between items-center p-5 rounded-lg" style={{ backgroundColor: 'rgba(15, 15, 20, 0.6)', backdropFilter: 'blur(10px)' }}>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Welcome, {user?.firstName || user?.username}
              </h1>
              <p className="text-gray-300">
                Track your health and fitness journey all in one place
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => logoutMutation.mutate()} 
              className="flex items-center gap-2 border-white/20 hover:bg-white/10 text-white"
            >
              <LogOutIcon className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>

          {/* Dashboard Tabs */}
          <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6 sm:grid-cols-6 max-w-2xl rounded-lg" style={{ backgroundColor: 'rgba(15, 15, 20, 0.7)', backdropFilter: 'blur(10px)' }}>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <TrendingUpIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="nutrition" className="flex items-center gap-2">
                <UtensilsIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Nutrition</span>
              </TabsTrigger>
              <TabsTrigger value="exercise" className="flex items-center gap-2">
                <DumbbellIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Exercise</span>
              </TabsTrigger>
              <TabsTrigger value="water" className="flex items-center gap-2">
                <DropletIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Water</span>
              </TabsTrigger>
              <TabsTrigger value="mental" className="flex items-center gap-2">
                <BrainIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Mental</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="p-6 rounded-lg" style={{ backgroundColor: 'rgba(15, 15, 20, 0.5)', backdropFilter: 'blur(10px)' }}>
                {/* Date Header */}
                <div className="flex items-center gap-2 text-sm text-white mb-6">
                  <CalendarIcon className="h-4 w-4 text-blue-300" />
                  <span className="font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(30, 30, 40, 0.7)', backdropFilter: 'blur(5px)' }}>
                    <div className="pb-2">
                      <p className="text-xs font-medium text-gray-400">Daily Calories</p>
                      <h3 className="text-2xl font-bold text-white">2,100 / 2,300</h3>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full" style={{ width: '91%' }}></div>
                      </div>
                      <p className="text-sm text-gray-400 mt-2">200 calories remaining</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(30, 30, 40, 0.7)', backdropFilter: 'blur(5px)' }}>
                    <div className="pb-2">
                      <p className="text-xs font-medium text-gray-400">Daily Water</p>
                      <h3 className="text-2xl font-bold text-white">1.2 / 2.5 L</h3>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: '48%' }}></div>
                      </div>
                      <p className="text-sm text-gray-400 mt-2">1.3 L remaining</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(30, 30, 40, 0.7)', backdropFilter: 'blur(5px)' }}>
                    <div className="pb-2">
                      <p className="text-xs font-medium text-gray-400">Exercise</p>
                      <h3 className="text-2xl font-bold text-white">320 kcal</h3>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Calories burned today</p>
                      <p className="text-sm text-gray-400">45 minutes of activity</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(30, 30, 40, 0.7)', backdropFilter: 'blur(5px)' }}>
                    <div className="pb-2">
                      <p className="text-xs font-medium text-gray-400">Net Calories</p>
                      <h3 className="text-2xl font-bold text-white">1,780 kcal</h3>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Consumed: 2,100 kcal</p>
                      <p className="text-sm text-gray-400">Burned: 320 kcal</p>
                    </div>
                  </div>
                </div>

                {/* Macronutrient Breakdown */}
                <div className="mb-6 p-5 rounded-lg" style={{ backgroundColor: 'rgba(30, 30, 40, 0.7)', backdropFilter: 'blur(5px)' }}>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white">Macronutrient Breakdown</h3>
                    <p className="text-gray-400 text-sm">Daily nutrition distribution</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-amber-300">Carbohydrates</h3>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: '65%' }}></div>
                        </div>
                        <span className="text-sm font-medium text-white">65%</span>
                      </div>
                      <p className="text-sm text-gray-400">195g / 300g</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-green-300">Protein</h3>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full rounded-full" style={{ width: '80%' }}></div>
                        </div>
                        <span className="text-sm font-medium text-white">80%</span>
                      </div>
                      <p className="text-sm text-gray-400">120g / 150g</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-red-300">Fat</h3>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-full rounded-full" style={{ width: '45%' }}></div>
                        </div>
                        <span className="text-sm font-medium text-white">45%</span>
                      </div>
                      <p className="text-sm text-gray-400">35g / 77g</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="p-5 rounded-lg" style={{ backgroundColor: 'rgba(30, 30, 40, 0.7)', backdropFilter: 'blur(5px)' }}>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                    <p className="text-gray-400 text-sm">Your latest food and exercise entries</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-700 pb-4">
                      <div className="flex items-center gap-4">
                        <UtensilsIcon className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="font-medium text-white">Chicken Salad</p>
                          <p className="text-sm text-gray-400">Lunch</p>
                        </div>
                      </div>
                      <p className="font-medium text-white">420 kcal</p>
                    </div>
                    
                    <div className="flex items-center justify-between border-b border-gray-700 pb-4">
                      <div className="flex items-center gap-4">
                        <DumbbellIcon className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="font-medium text-white">Jogging</p>
                          <p className="text-sm text-gray-400">30 minutes</p>
                        </div>
                      </div>
                      <p className="font-medium text-green-400">-250 kcal</p>
                    </div>
                    
                    <div className="flex items-center justify-between border-b border-gray-700 pb-4">
                      <div className="flex items-center gap-4">
                        <DropletIcon className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="font-medium text-white">Water</p>
                          <p className="text-sm text-gray-400">12:30 PM</p>
                        </div>
                      </div>
                      <p className="font-medium text-white">300 ml</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <UtensilsIcon className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="font-medium text-white">Protein Shake</p>
                          <p className="text-sm text-gray-400">Snack</p>
                        </div>
                      </div>
                      <p className="font-medium text-white">180 kcal</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Nutrition Tab */}
            <TabsContent value="nutrition">
              <NutritionTab />
            </TabsContent>

            {/* Exercise Tab */}
            <TabsContent value="exercise">
              <ExerciseTab />
            </TabsContent>

            {/* Water Tab */}
            <TabsContent value="water">
              <WaterTab />
            </TabsContent>

            {/* Mental Health Tab */}
            <TabsContent value="mental">
              <MentalTab />
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="p-6 rounded-lg" style={{ backgroundColor: 'rgba(15, 15, 20, 0.5)', backdropFilter: 'blur(10px)' }}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Your Profile</h2>
                    <p className="text-gray-300">Manage your account and preferences</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}