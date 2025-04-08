import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Brain as BrainIcon, Plus as PlusIcon, Sun as SunIcon, Cloud as CloudIcon, CloudRain as CloudRainIcon, CloudLightning as CloudLightningIcon, Smile as SmileIcon } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mental entry form schema
const moodOptions = ["Great", "Good", "Okay", "Low", "Bad"] as const;
type MoodType = typeof moodOptions[number];

const mentalEntryFormSchema = z.object({
  date: z.date(),
  mood: z.enum(moodOptions),
  stressLevel: z.number().min(0).max(10),
  sleepHours: z.number().min(0).max(24),
  notes: z.string().max(1000).optional(),
});

type MentalEntryFormValues = z.infer<typeof mentalEntryFormSchema>;

// Mock interface for mental health entries (would be defined in shared/schema.ts in a real app)
interface MentalEntry {
  id: number;
  userId: number;
  date: string;
  mood: MoodType;
  stressLevel: number;
  sleepHours: number;
  notes?: string;
  createdAt: string;
}

export function MentalTab() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // This would normally fetch from the API - using mock data for now
  const { data: mentalEntries = [], isLoading } = useQuery<MentalEntry[]>({
    queryKey: ["/api/mental-entries", selectedDate.toISOString().split('T')[0]],
    queryFn: async () => {
      // In a real implementation, this would call the API
      // For now, we'll return mock data based on the current date
      const date = selectedDate.toISOString().split('T')[0];
      return [
        {
          id: 1,
          userId: 1,
          date,
          mood: "Good",
          stressLevel: 4,
          sleepHours: 7.5,
          notes: "Had a productive day. Meditated for 10 minutes in the morning.",
          createdAt: new Date().toISOString()
        }
      ];
    },
  });

  // Form for adding mental health entry
  const form = useForm<MentalEntryFormValues>({
    resolver: zodResolver(mentalEntryFormSchema),
    defaultValues: {
      date: selectedDate,
      mood: "Good",
      stressLevel: 3,
      sleepHours: 7,
      notes: "",
    },
  });

  // Mock mutation for adding a mental health entry
  const addMentalEntryMutation = useMutation({
    mutationFn: async (data: MentalEntryFormValues) => {
      // In a real implementation, this would call the API
      console.log("Would add mental entry:", data);
      return {
        id: Math.floor(Math.random() * 1000),
        userId: 1,
        date: data.date.toISOString().split('T')[0],
        mood: data.mood,
        stressLevel: data.stressLevel,
        sleepHours: data.sleepHours,
        notes: data.notes,
        createdAt: new Date().toISOString()
      };
    },
    onSuccess: () => {
      //queryClient.invalidateQueries({ queryKey: ["/api/mental-entries"] });
      toast({
        title: "Mental health entry added",
        description: "Your entry has been logged successfully.",
      });
      setIsAddDialogOpen(false);
      form.reset({
        date: selectedDate,
        mood: "Good",
        stressLevel: 3,
        sleepHours: 7,
        notes: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: MentalEntryFormValues) {
    addMentalEntryMutation.mutate(data);
  }

  // Helper function to render mood icon
  function getMoodIcon(mood: MoodType) {
    switch (mood) {
      case "Great":
        return <SunIcon className="h-5 w-5 text-yellow-500" />;
      case "Good":
        return <SmileIcon className="h-5 w-5 text-green-500" />;
      case "Okay":
        return <CloudIcon className="h-5 w-5 text-blue-400" />;
      case "Low":
        return <CloudRainIcon className="h-5 w-5 text-blue-600" />;
      case "Bad":
        return <CloudLightningIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <BrainIcon className="h-5 w-5 text-muted-foreground" />;
    }
  }

  return (
    <div className="bg-background/80 backdrop-blur-md p-6 rounded-lg">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold">Mental Health</h2>
          <p className="text-muted-foreground">Track your mood and mental wellbeing</p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                <span>Log Entry</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Mental Health Entry</DialogTitle>
                <DialogDescription>
                  Record your mood, stress levels, and sleep patterns to track your mental wellbeing.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                              onSelect={field.onChange}
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
                  
                  <FormField
                    control={form.control}
                    name="mood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overall Mood</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your mood" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {moodOptions.map((mood) => (
                              <SelectItem key={mood} value={mood}>
                                <div className="flex items-center gap-2">
                                  {getMoodIcon(mood)}
                                  <span>{mood}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="stressLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Stress Level: <span className="font-medium">{field.value}</span>
                        </FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="pt-2"
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>No stress</span>
                          <span>Moderate</span>
                          <span>Extreme</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sleepHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sleep Hours</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.5"
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
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="How was your day? What's on your mind?"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" disabled={addMentalEntryMutation.isPending}>
                      {addMentalEntryMutation.isPending ? "Saving..." : "Save Entry"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Daily Reflection Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Daily Reflection</CardTitle>
          <CardDescription>
            {format(selectedDate, "MMMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading mental health entries...</p>
          ) : mentalEntries.length === 0 ? (
            <div className="text-center py-6">
              <BrainIcon className="mx-auto h-10 w-10 text-primary/20 mb-2" />
              <p className="text-muted-foreground">No entries for this day yet.</p>
              <p className="text-sm text-muted-foreground">
                Click "Log Entry" to record your mental wellbeing.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {mentalEntries.map((entry) => (
                <div key={entry.id} className="space-y-4">
                  <div className="flex items-center gap-3">
                    {getMoodIcon(entry.mood)}
                    <span className="font-medium">Mood: {entry.mood}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Stress Level</p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              entry.stressLevel <= 3 
                                ? "bg-green-500" 
                                : entry.stressLevel <= 7 
                                ? "bg-amber-500" 
                                : "bg-red-500"
                            }`} 
                            style={{ width: `${(entry.stressLevel / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{entry.stressLevel}/10</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Sleep Duration</p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              entry.sleepHours >= 7 
                                ? "bg-green-500" 
                                : entry.sleepHours >= 5 
                                ? "bg-amber-500" 
                                : "bg-red-500"
                            }`} 
                            style={{ width: `${Math.min((entry.sleepHours / 10) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{entry.sleepHours} hours</span>
                      </div>
                    </div>
                  </div>
                  
                  {entry.notes && (
                    <div className="bg-muted/50 p-4 rounded-md">
                      <p className="text-sm font-medium mb-1">Notes</p>
                      <p className="text-sm text-muted-foreground">{entry.notes}</p>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Logged at: {new Date(entry.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Mental Health Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Mental Health Resources</CardTitle>
          <CardDescription>Helpful resources for your wellbeing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Meditation Resources</h3>
              <ul className="text-sm space-y-1">
                <li>• 5-Minute Breathing Exercise</li>
                <li>• Guided Meditation for Stress</li>
                <li>• Mindfulness Practice for Beginners</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Sleep Improvement</h3>
              <ul className="text-sm space-y-1">
                <li>• Sleep Hygiene Checklist</li>
                <li>• Relaxation Techniques for Bedtime</li>
                <li>• Creating an Optimal Sleep Environment</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Stress Management</h3>
              <ul className="text-sm space-y-1">
                <li>• Quick Stress Relief Techniques</li>
                <li>• Understanding Your Stress Triggers</li>
                <li>• Work-Life Balance Strategies</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Support Resources</h3>
              <ul className="text-sm space-y-1">
                <li>• Crisis Helplines Directory</li>
                <li>• Finding a Mental Health Professional</li>
                <li>• Online Support Communities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}