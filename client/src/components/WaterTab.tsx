import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus as PlusIcon, Droplet as DropletIcon } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { WaterEntry } from "@shared/schema";

// Form schema for adding water entry
const waterEntryFormSchema = z.object({
  date: z.date(),
  amount: z.number().min(1, "Amount must be at least 1ml").max(5000, "Amount cannot exceed 5000ml"),
});

type WaterEntryFormValues = z.infer<typeof waterEntryFormSchema>;

export function WaterTab() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Default daily water target in milliliters
  const dailyWaterTarget = 2500;

  // Get water entries for the selected date
  const { data: waterEntries = [], isLoading } = useQuery<WaterEntry[]>({
    queryKey: ["/api/water-entries", selectedDate.toISOString().split('T')[0]],
    queryFn: async () => {
      const dateParam = selectedDate.toISOString().split('T')[0];
      const res = await fetch(`/api/water-entries?date=${dateParam}`);
      if (!res.ok) throw new Error("Failed to fetch water entries");
      return res.json();
    },
  });

  // Calculate total water consumed for the day
  const totalWaterConsumed = waterEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const waterPercentage = Math.min(100, Math.round((totalWaterConsumed / dailyWaterTarget) * 100));
  const remainingWater = Math.max(0, dailyWaterTarget - totalWaterConsumed);

  // Form for adding water entry
  const form = useForm<WaterEntryFormValues>({
    resolver: zodResolver(waterEntryFormSchema),
    defaultValues: {
      date: selectedDate,
      amount: 250, // Default amount (250ml)
    },
  });

  // Mutation for adding a new water entry
  const addWaterMutation = useMutation({
    mutationFn: async (data: WaterEntryFormValues) => {
      const requestData = {
        date: data.date.toISOString().split('T')[0],
        amount: data.amount,
      };
      const response = await apiRequest("/api/water-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/water-entries"] });
      toast({
        title: "Water entry added",
        description: "Your water intake has been logged successfully.",
      });
      setIsAddDialogOpen(false);
      form.reset({
        date: selectedDate,
        amount: 250,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add water entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting a water entry
  const deleteWaterMutation = useMutation({
    mutationFn: async (id: number) => {
      const url = `/api/water-entries/${id}`;
      await apiRequest(url, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/water-entries"] });
      toast({
        title: "Water entry deleted",
        description: "The water entry has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete water entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: WaterEntryFormValues) {
    addWaterMutation.mutate(data);
  }

  // Quick-add predefined amounts
  const quickAddOptions = [
    { label: "Small Glass", amount: 200 },
    { label: "Regular Glass", amount: 250 },
    { label: "Large Glass", amount: 350 },
    { label: "Bottle", amount: 500 },
    { label: "Large Bottle", amount: 1000 },
  ];

  function handleQuickAdd(amount: number) {
    addWaterMutation.mutate({
      date: selectedDate,
      amount: amount,
    });
  }

  return (
    <div className="p-6 rounded-lg" style={{ backgroundColor: 'rgba(15, 15, 20, 0.5)', backdropFilter: 'blur(10px)' }}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Water Tracking</h2>
          <p className="text-gray-300">Track your daily water intake</p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-700/70 text-white">
                <CalendarIcon className="h-4 w-4" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) setSelectedDate(date);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                <span>Log Water</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Water Intake</DialogTitle>
                <DialogDescription>
                  Record your water consumption. Consistency is key to staying hydrated.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (ml)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                if (date) field.onChange(date);
                              }}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" disabled={addWaterMutation.isPending}>
                      {addWaterMutation.isPending ? "Saving..." : "Save Entry"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Daily Progress Card */}
      <div className="mb-6 p-5 rounded-lg" style={{ backgroundColor: 'rgba(30, 30, 40, 0.7)', backdropFilter: 'blur(5px)' }}>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white">Daily Water Intake</h3>
          <p className="text-gray-400 text-sm">
            {format(selectedDate, "MMMM d, yyyy")}
          </p>
        </div>
        <div className="text-center mb-4">
          <div className="text-4xl font-bold text-blue-500">
            {(totalWaterConsumed / 1000).toFixed(1)} / {(dailyWaterTarget / 1000).toFixed(1)} L
          </div>
          <p className="text-gray-400 mt-1">
            {remainingWater > 0 
              ? `${(remainingWater / 1000).toFixed(1)} L remaining` 
              : "Daily goal reached! 🎉"}
          </p>
        </div>
        
        <div className="h-8 bg-gray-700 rounded-full overflow-hidden mb-6">
          <div 
            className="bg-blue-500 h-full rounded-full transition-all" 
            style={{ width: `${waterPercentage}%` }}
          ></div>
        </div>
          
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {quickAddOptions.map((option) => (
            <Button 
              key={option.label}
              variant="outline" 
              className="flex items-center gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-700/70"
              onClick={() => handleQuickAdd(option.amount)}
              disabled={addWaterMutation.isPending}
            >
              <DropletIcon className="h-4 w-4 text-blue-500" />
              <div className="flex flex-col items-start">
                <span className="text-xs text-white">{option.label}</span>
                <span className="text-xs text-gray-400">{option.amount} ml</span>
              </div>
            </Button>
          ))}
        </div>
      </div>
      
      {/* Water Log */}
      <div className="p-5 rounded-lg" style={{ backgroundColor: 'rgba(30, 30, 40, 0.7)', backdropFilter: 'blur(5px)' }}>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white">Water Log</h3>
          <p className="text-gray-400 text-sm">Your water intake history for the day</p>
        </div>
        
        {isLoading ? (
          <p className="text-white">Loading water entries...</p>
        ) : waterEntries.length === 0 ? (
          <div className="text-center py-6">
            <DropletIcon className="mx-auto h-10 w-10 text-blue-500/20 mb-2" />
            <p className="text-gray-400">No water entries for this day yet.</p>
            <p className="text-sm text-gray-400">
              Click "Log Water" to record your first intake.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {waterEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between border-b border-gray-700 pb-3">
                <div className="flex items-center gap-4">
                  <DropletIcon className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-white">{entry.amount} ml</p>
                    <p className="text-sm text-gray-400">
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : ''}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                  onClick={() => deleteWaterMutation.mutate(entry.id)}
                  disabled={deleteWaterMutation.isPending}
                >
                  Remove
                </Button>
              </div>
            ))}
            
            <div className="pt-2">
              <p className="text-sm text-gray-400">
                Total: <span className="font-medium text-white">{totalWaterConsumed} ml</span> ({(totalWaterConsumed / 1000).toFixed(1)} L)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}