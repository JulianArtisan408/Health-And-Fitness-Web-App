import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { searchExercises, createExercise, getExerciseCategories, getExercisesByCategory } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, PlusCircle, ListFilter } from "lucide-react";
import { ExerciseData } from "../types";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";

interface ExerciseSearchProps {
  onSelectExercise: (exercise: ExerciseData) => void;
}

// Custom exercise form schema
const customExerciseSchema = z.object({
  name: z.string().min(2, "Name is too short").max(100, "Name is too long"),
  category: z.string().min(2, "Category is too short").max(50, "Category is too long"),
  caloriesBurnedPerMinute: z.coerce.number().min(1, "Must be at least 1").max(50, "Cannot exceed 50"),
  description: z.string().optional(),
});

type CustomExerciseFormValues = z.infer<typeof customExerciseSchema>;

export function ExerciseSearch({ onSelectExercise }: ExerciseSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form setup for custom exercise
  const form = useForm<CustomExerciseFormValues>({
    resolver: zodResolver(customExerciseSchema),
    defaultValues: {
      name: "",
      category: "",
      caloriesBurnedPerMinute: 5,
      description: "",
    },
  });
  
  // Query for exercise search
  const { data: exercises, isLoading: isSearchLoading } = useQuery({
    queryKey: ['/api/exercises/search', debouncedSearchTerm],
    queryFn: () => searchExercises(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length > 1 && activeTab === "search",
  });
  
  // Query for exercise categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/exercises/categories'],
    queryFn: () => getExerciseCategories(),
    enabled: activeTab === "categories",
  });
  
  // Query for exercises by category
  const { data: categoryExercises, isLoading: isCategoryExercisesLoading } = useQuery({
    queryKey: ['/api/exercises/category', selectedCategory],
    queryFn: () => getExercisesByCategory(selectedCategory!),
    enabled: !!selectedCategory && activeTab === "categories",
  });
  
  // Mutation for creating a custom exercise
  const createExerciseMutation = useMutation({
    mutationFn: createExercise,
    onSuccess: (newExercise) => {
      queryClient.invalidateQueries({ queryKey: ['/api/exercises/search'] });
      toast({
        title: "Exercise created",
        description: "Your custom exercise has been added",
      });
      setIsCustomDialogOpen(false);
      form.reset();
      onSelectExercise(newExercise);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create exercise: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle custom exercise form submission
  const onSubmitCustomExercise = (values: CustomExerciseFormValues) => {
    createExerciseMutation.mutate({
      ...values,
      isUserCreated: true,
    });
  };
  
  // Handle selecting a custom exercise instead of creating one
  const handleCustomExercise = () => {
    const customExercise: ExerciseData = {
      id: -1, // Temporary ID that will be replaced after creation
      name: form.getValues().name,
      category: form.getValues().category,
      caloriesBurnedPerMinute: form.getValues().caloriesBurnedPerMinute,
      description: form.getValues().description || "",
      isUserCreated: true,
    };
    onSelectExercise(customExercise);
    setIsCustomDialogOpen(false);
  };
  
  // Helper function to display exercise list
  const renderExerciseList = (exerciseList: ExerciseData[] | undefined, isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    if (!exerciseList || exerciseList.length === 0) {
      return (
        <div className="text-center p-4">
          <p>No exercises found. Want to create a custom one?</p>
        </div>
      );
    }
    
    return (
      <div className="max-h-[300px] overflow-y-auto space-y-2">
        {exerciseList.map((exercise) => (
          <Button
            key={exercise.id}
            variant="ghost"
            className="w-full justify-start text-left h-auto py-3 px-4"
            onClick={() => onSelectExercise(exercise)}
          >
            <div>
              <p className="font-medium">{exercise.name}</p>
              <p className="text-sm text-muted-foreground">
                {exercise.category} • ~{exercise.caloriesBurnedPerMinute} cal/min
              </p>
            </div>
          </Button>
        ))}
      </div>
    );
  };
  
  // Effect to update form's category field when a category is selected
  useEffect(() => {
    if (selectedCategory && form) {
      form.setValue("category", selectedCategory);
    }
  }, [selectedCategory, form]);
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
          
          {debouncedSearchTerm.length > 1 ? (
            renderExerciseList(exercises, isSearchLoading)
          ) : (
            <div className="text-center text-muted-foreground p-4">
              <p>Type to search for exercises</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="categories" className="pt-4">
          {isCategoriesLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {selectedCategory ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mb-2"
                    onClick={() => setSelectedCategory(null)}
                  >
                    ← Back to Categories
                  </Button>
                  <h3 className="text-lg font-medium capitalize">{selectedCategory} Exercises</h3>
                  {renderExerciseList(categoryExercises, isCategoryExercisesLoading)}
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {categories?.map((category) => (
                    <Button
                      key={category}
                      variant="outline"
                      className="h-auto py-3 justify-start capitalize"
                      onClick={() => setSelectedCategory(category)}
                    >
                      <ListFilter className="mr-2 h-4 w-4" />
                      {category.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="pt-2">
        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={() => setIsCustomDialogOpen(true)}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Create Custom Exercise</span>
        </Button>
      </div>
      
      {/* Custom Exercise Dialog */}
      <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Exercise</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitCustomExercise)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exercise Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mountain Biking" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Cardio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="caloriesBurnedPerMinute"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories Burned per Minute</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        step="0.1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Add details about this exercise" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="sm:w-full"
                  onClick={() => setIsCustomDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  variant="secondary"
                  className="sm:w-full"
                  onClick={handleCustomExercise}
                >
                  Use Without Saving
                </Button>
                <Button 
                  type="submit"
                  className="sm:w-full"
                  disabled={createExerciseMutation.isPending}
                >
                  {createExerciseMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Exercise
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}