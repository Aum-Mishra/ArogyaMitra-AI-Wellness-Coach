import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { MealItem } from "../components/shared/ProgressComponents";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { CheckCircle2, ChefHat, BookOpen, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../services/api";

interface Meal {
  meal: string;
  description: string;
  calories: number;
  completed?: boolean;
}

interface DayMeal {
  day: number;
  meals: Meal[];
}

export function MealPlan() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeklyMeals, setWeeklyMeals] = useState<DayMeal[]>([]);
  const [mealCompletions, setMealCompletions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        setLoading(true);
        console.log("[MealPlan] Fetching meal plan for user:", user?.id);
        
        const response = await apiClient.getMealPlan();
        console.log("[MealPlan] Raw API response:", response);
        
        const plan = response.data || response;
        console.log("[MealPlan] Extracted plan object:", plan);
        console.log("[MealPlan] Plan has 'plan' field:", !!plan?.plan);
        console.log("[MealPlan] Plan has 'plan_json' field:", !!plan?.plan_json);
        
        if (plan && (plan.plan || plan.plan_json)) {
          let planData;
          if (plan.plan) {
            planData = plan.plan;
            console.log("[MealPlan] Using plan.plan field");
          } else if (typeof plan.plan_json === 'string') {
            planData = JSON.parse(plan.plan_json);
            console.log("[MealPlan] Parsed plan.plan_json (was string)");
          } else {
            planData = plan.plan_json;
            console.log("[MealPlan] Using plan.plan_json directly");
          }
          
          console.log("[MealPlan] Parsed plan data:", planData);
          console.log("[MealPlan] Available fields:", Object.keys(planData));
          
          // The LLM returns { plan: [...], daily_total: {...} } or { plan: [...] }
          const dailyMeals = planData.plan || planData.daily_meals || [];
          console.log("[MealPlan] Processing", dailyMeals.length, "days");
          
          const formatted = dailyMeals.map((day: any, idx: number) => {
            // Each day from LLM has: { day, date, breakfast, lunch, dinner, snacks }
            // Convert to format expected by frontend: { day, meals: [...] }
            const meals = [
              day.breakfast && { meal: day.breakfast.name || day.breakfast, description: "", calories: day.breakfast.calories || 0 },
              day.lunch && { meal: day.lunch.name || day.lunch, description: "", calories: day.lunch.calories || 0 },
              day.dinner && { meal: day.dinner.name || day.dinner, description: "", calories: day.dinner.calories || 0 },
              day.snacks && { meal: day.snacks.name || day.snacks, description: "", calories: day.snacks.calories || 0 }
            ].filter(Boolean);
            
            console.log(`[MealPlan] Day ${idx + 1}:`, meals.length, "meals");
            return {
              day: idx + 1,
              meals: meals,
            };
          });

          console.log("[MealPlan] Formatted meals:", formatted);
          setWeeklyMeals(formatted);

          // Initialize completion tracking
          const initialCompletions: Record<string, boolean> = {};
          formatted.forEach((day: DayMeal) => {
            day.meals.forEach((meal: Meal, mealIdx: number) => {
              initialCompletions[`${day.day}-${mealIdx}`] = false;
            });
          });
          setMealCompletions(initialCompletions);
          console.log("[MealPlan] Successfully set meals state with", formatted.length, "days");
        } else {
          const errorMsg = "Invalid plan structure. Plan data not found. Please generate a new meal plan.";
          console.error("[MealPlan] Invalid plan structure:");
          console.error("  - plan exists:", !!plan);
          console.error("  - plan.plan exists:", !!plan?.plan);
          console.error("  - plan.plan_json exists:", !!plan?.plan_json);
          console.error("  - Full plan object:", plan);
          setError(errorMsg);
        }
      } catch (error: any) {
        const errorMsg = `Failed to fetch meal plan: ${error.response?.status === 404 ? 'Not found - generate a new plan' : error.response?.data?.detail || error.message}`;
        console.error("[MealPlan] Error fetching meal plan:", error);
        console.error("[MealPlan] Error status:", error.response?.status);
        console.error("[MealPlan] Error message:", error.response?.data?.detail || error.message);
        console.error("[MealPlan] Full error:", error);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMealPlan();
    }
  }, [user]);

  const toggleMeal = async (dayNum: number, mealIdx: number) => {
    const key = `${dayNum}-${mealIdx}`;
    setMealCompletions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    try {
      const meal = weeklyMeals[dayNum - 1]?.meals[mealIdx];
      await apiClient.completeMeal({
        meal_name: meal?.meal || `Meal ${mealIdx}`,
        completed: !mealCompletions[key],
      });
    } catch (error) {
      console.error("Error updating meal progress:", error);
    }
  };

  const getDayCompletion = (dayNum: number) => {
    const day = weeklyMeals[dayNum - 1];
    if (!day) return { completed: 0, total: 0, consumedCalories: 0, totalCalories: 0 };
    const completed = day.meals.filter((_, idx) => mealCompletions[`${dayNum}-${idx}`]).length;
    const consumedCalories = day.meals
      .filter((_, idx) => mealCompletions[`${dayNum}-${idx}`])
      .reduce((sum, meal) => sum + (meal.calories || 0), 0);
    const totalCalories = day.meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    return { completed, total: day.meals.length, consumedCalories, totalCalories };
  };

  const totalWeeklyCalories = weeklyMeals.reduce((sum, day) => {
    const dayCalories = day.meals.reduce((daySum, meal) => daySum + (meal.calories || 0), 0);
    return sum + dayCalories;
  }, 0);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-accent" />
          <p className="text-muted-foreground">Loading your meal plan...</p>
        </div>
      </div>
    );
  }

  if (weeklyMeals.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            {error ? (
              <>
                <p className="text-red-500 mb-2 font-medium">❌ {error}</p>
                <p className="text-sm text-muted-foreground">Go to Settings and click "Regenerate Plans" to create a new meal plan.</p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-2">No meal plan generated yet.</p>
                <p className="text-sm text-muted-foreground">Complete your health profile setup to get a personalized meal plan!</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold">Your Meal Plan</h1>
          <p className="text-muted-foreground text-[14px]">
            Balanced nutrition plan customized for your dietary preferences
          </p>
        </div>
        <Card className="md:w-auto bg-gradient-to-br from-accent to-destructive text-white border-none">
          <CardContent className="p-4 flex items-center gap-3">
            <ChefHat className="w-8 h-8" />
            <div>
              <p className="text-[20px] font-semibold">{totalWeeklyCalories.toLocaleString()} kcal</p>
              <p className="text-[12px] opacity-90">Weekly Target</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" />
            Weekly Meal Overview
          </CardTitle>
          <CardDescription>Track your nutrition across the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weeklyMeals.map((day) => {
              const { completed, total, consumedCalories, totalCalories } = getDayCompletion(day.day);
              const isCompleted = total > 0 && completed === total;
              return (
                <div
                  key={day.day}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isCompleted
                      ? "bg-accent/10 border-accent"
                      : "bg-white border-border hover:border-accent/40"
                  }`}
                >
                  <div className="text-center">
                    <p className="text-[11px] text-muted-foreground font-medium">Day {day.day}</p>
                    {isCompleted && <CheckCircle2 className="w-6 h-6 text-accent mx-auto mt-1" />}
                    {!isCompleted && total > 0 && (
                      <div className="mt-1">
                        <p className="text-[14px] font-semibold">{consumedCalories}</p>
                        <p className="text-[10px] text-muted-foreground">/{totalCalories}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Meal Days */}
      {weeklyMeals.length > 0 && (
        <Tabs defaultValue="1" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
            {weeklyMeals.map((day) => {
              const { completed, total } = getDayCompletion(day.day);
              const isCompleted = total > 0 && completed === total;
              return (
                <TabsTrigger key={day.day} value={day.day.toString()} className="relative">
                  Day {day.day}
                  {isCompleted && (
                    <CheckCircle2 className="w-4 h-4 text-accent absolute -top-1 -right-1" />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {weeklyMeals.map((day) => {
            const { completed, total, consumedCalories, totalCalories } = getDayCompletion(day.day);
            const isCompleted = total > 0 && completed === total;
            return (
              <TabsContent key={day.day} value={day.day.toString()} className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-[18px]">Day {day.day} Nutrition</CardTitle>
                        <CardDescription>
                          Target: {totalCalories} kcal | Consumed: {consumedCalories} kcal
                        </CardDescription>
                      </div>
                      <Badge
                        variant={isCompleted ? "default" : "secondary"}
                        className={isCompleted ? "bg-accent" : ""}
                      >
                        {completed} / {total} Meals
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {day.meals.map((meal, mealIdx) => (
                      <MealItem
                        key={mealIdx}
                        meal={meal.meal || `Meal ${mealIdx + 1}`}
                        description={meal.description || ""}
                        calories={meal.calories || 0}
                        completed={!!mealCompletions[`${day.day}-${mealIdx}`]}
                        onToggle={() => toggleMeal(day.day, mealIdx)}
                      />
                    ))}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                      <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-[20px] font-semibold text-primary">
                            {consumedCalories}
                          </p>
                          <p className="text-[12px] text-muted-foreground">Consumed Calories</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-accent/5 border-accent/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-[20px] font-semibold text-accent">
                            {Math.max(0, totalCalories - consumedCalories)}
                          </p>
                          <p className="text-[12px] text-muted-foreground">Remaining Calories</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-secondary/5 border-secondary/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-[20px] font-semibold text-secondary">
                            {totalCalories > 0 ? Math.round((consumedCalories / totalCalories) * 100) : 0}%
                          </p>
                          <p className="text-[12px] text-muted-foreground">Daily Progress</p>
                        </CardContent>
                      </Card>
                    </div>

                    {isCompleted && (
                      <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg flex items-center gap-3">
                        <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                          <ChefHat className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-accent">Day {day.day} Nutrition Complete!</p>
                          <p className="text-[13px] text-muted-foreground">
                            Excellent work on following your meal plan today.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}
