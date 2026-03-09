import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { CircularProgress, WorkoutItem, MealItem, ProgressBar } from "../components/shared/ProgressComponents";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Activity, Droplets, Footprints, Target, Send, Sparkles, Award, Loader2 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../services/api";

interface WorkoutExercise {
  name: string;
  sets?: number;
  reps?: number;
  duration?: string;
  completed?: boolean;
}

interface MealItem {
  meal: string;
  description: string;
  calories: number;
  completed?: boolean;
}

export function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutExercise[]>([]);
  const [mealPlan, setMealPlan] = useState<MealItem[]>([]);
  const [workoutProgress, setWorkoutProgress] = useState<{[key: string]: boolean}>({});
  const [mealProgress, setMealProgress] = useState<{[key: string]: boolean}>({});
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string}>>([]);
  const [sendingChat, setSendingChat] = useState(false);
  const [stats, setStats] = useState({
    water_intake: 0,
    max_water: 8,
    daily_steps: 0,
    max_steps: 10000,
    streak_days: 0,
    workouts_completed: 0,
    meals_completed: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch workout plan
        const workoutRes = await apiClient.getWorkoutPlan();
        if (workoutRes && workoutRes.plan_json) {
          const parsedWorkout = typeof workoutRes.plan_json === 'string' 
            ? JSON.parse(workoutRes.plan_json) 
            : workoutRes.plan_json;
          const exercises = parsedWorkout.daily_workout?.[0]?.exercises || parsedWorkout.exercises || [];
          setWorkoutPlan(exercises);
          setWorkoutProgress(exercises.reduce((acc: any, ex: any, idx: number) => {
            acc[idx] = false;
            return acc;
          }, {}));
        }
        
        // Fetch meal plan
        const mealRes = await apiClient.getMealPlan();
        if (mealRes && mealRes.plan_json) {
          const parsedMeal = typeof mealRes.plan_json === 'string' 
            ? JSON.parse(mealRes.plan_json) 
            : mealRes.plan_json;
          const meals = parsedMeal.daily_meals?.[0]?.meals || parsedMeal.meals || [];
          setMealPlan(meals);
          setMealProgress(meals.reduce((acc: any, meal: any, idx: number) => {
            acc[idx] = false;
            return acc;
          }, {}));
        }

        // Fetch dashboard summary (stats)
        const summaryRes = await apiClient.getDashboardSummary();
        if (summaryRes) {
          setStats({
            water_intake: summaryRes.water_intake || 0,
            max_water: summaryRes.max_water || 8,
            daily_steps: summaryRes.daily_steps || 0,
            max_steps: summaryRes.max_steps || 10000,
            streak_days: summaryRes.streak_days || 0,
            workouts_completed: summaryRes.workouts_completed || 0,
            meals_completed: summaryRes.meals_completed || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleWorkoutToggle = async (index: number) => {
    try {
      setWorkoutProgress((prev) => ({
        ...prev,
        [index]: !prev[index],
      }));
      // Call API to record completion
      await apiClient.completeExercise(index);
    } catch (error) {
      console.error("Error updating workout progress:", error);
    }
  };

  const handleMealToggle = async (index: number) => {
    try {
      setMealProgress((prev) => ({
        ...prev,
        [index]: !prev[index],
      }));
      // Call API to record completion
      await apiClient.completeMeal(index);
    } catch (error) {
      console.error("Error updating meal progress:", error);
    }
  };

  const handleSendChat = async () => {
    if (!chatMessage.trim()) return;

    try {
      setSendingChat(true);
      const newMessages = [
        ...chatMessages,
        { role: "user", content: chatMessage }
      ];
      setChatMessages(newMessages);
      setChatMessage("");

      const response = await apiClient.sendAromicMessage(chatMessage);
      newMessages.push({ role: "assistant", content: response.response || response });
      setChatMessages(newMessages);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingChat(false);
    }
  };

  const totalCalories = mealPlan.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const consumedCalories = mealPlan
    .filter((_, idx) => mealProgress[idx])
    .reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const completedWorkouts = Object.values(workoutProgress).filter(Boolean).length;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-none">
        <CardHeader>
          <CardTitle className="text-[20px]">Good Morning, {user?.name || "User"}! 🌟</CardTitle>
          <CardDescription>Let's make today count! Here's your wellness summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm">
              <CircularProgress value={consumedCalories} max={totalCalories || 1} size={70} label="kcal" />
              <p className="mt-2 text-[12px] text-muted-foreground">Calories Goal</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm">
              <CircularProgress 
                value={completedWorkouts} 
                max={workoutPlan.length || 1} 
                size={70} 
                color="#60a5fa" 
                label="done" 
              />
              <p className="mt-2 text-[12px] text-muted-foreground">Workout Progress</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm">
              <CircularProgress value={stats.water_intake} max={stats.max_water} size={70} color="#f97316" label="glasses" />
              <p className="mt-2 text-[12px] text-muted-foreground">Water Intake</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm">
              <CircularProgress value={stats.daily_steps} max={stats.max_steps} size={70} color="#8b5cf6" label="steps" />
              <p className="mt-2 text-[12px] text-muted-foreground">Daily Steps</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Workout */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Today's Workout
                </CardTitle>
                <CardDescription>Your personalized workout plan</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-[20px] font-semibold text-primary">{completedWorkouts}/{workoutPlan.length}</p>
                <p className="text-[12px] text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {workoutPlan.length > 0 ? (
              <>
                {workoutPlan.map((exercise, idx) => (
                  <WorkoutItem
                    key={idx}
                    exercise={exercise.name || `Exercise ${idx + 1}`}
                    details={exercise.sets && exercise.reps 
                      ? `${exercise.sets} sets × ${exercise.reps} reps`
                      : exercise.duration || ""}
                    completed={workoutProgress[idx] || false}
                    onToggle={() => handleWorkoutToggle(idx)}
                    showVideo
                  />
                ))}
                <ProgressBar
                  value={completedWorkouts}
                  max={workoutPlan.length}
                  label="Workout Completion"
                  color="bg-primary"
                />
              </>
            ) : (
              <p className="text-muted-foreground text-center py-8">No workout plan yet. Complete your health profile setup!</p>
            )}
          </CardContent>
        </Card>

        {/* AI Coach Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              AROMI AI Coach
            </CardTitle>
            <CardDescription>Your personal wellness assistant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {chatMessages.length === 0 ? (
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-lg p-3 flex-1">
                    <p className="text-[13px]">
                      Hi {user?.name}! I'm AROMI, your AI wellness coach. How can I help you today? Ask me about your plan, diet tips, or adjustments! 💪
                    </p>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`rounded-lg p-3 max-w-[80%] ${msg.role === "user" ? "bg-primary text-white" : "bg-muted"}`}>
                      <p className="text-[13px]">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ask AROMI anything..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendChat()}
                className="flex-1"
              />
              <Button 
                size="icon" 
                className="bg-primary hover:bg-primary/90"
                onClick={handleSendChat}
                disabled={sendingChat}
              >
                {sendingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Meal Plan */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  Today's Nutrition Plan
                </CardTitle>
                <CardDescription>Track your daily meals</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-[20px] font-semibold text-accent">{consumedCalories}</p>
                <p className="text-[12px] text-muted-foreground">/ {totalCalories} kcal</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mealPlan.length > 0 ? (
              <>
                {mealPlan.map((meal, idx) => (
                  <MealItem
                    key={idx}
                    meal={meal.meal || `Meal ${idx + 1}`}
                    description={meal.description || ""}
                    calories={meal.calories || 0}
                    completed={mealProgress[idx] || false}
                    onToggle={() => handleMealToggle(idx)}
                  />
                ))}
                <ProgressBar
                  value={consumedCalories}
                  max={totalCalories || 1}
                  label="Daily Calories"
                  color="bg-accent"
                />
              </>
            ) : (
              <p className="text-muted-foreground text-center py-8">No meal plan yet. Complete your health profile setup!</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Achievements
            </CardTitle>
            <CardDescription>Your recent milestones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <span className="text-[18px]">🏅</span>
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium">{stats.streak_days} Day Streak</p>
                <p className="text-[11px] text-muted-foreground">Keep it going!</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-[18px]">💪</span>
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium">{stats.workouts_completed} Workouts Completed</p>
                <p className="text-[11px] text-muted-foreground">Great progress!</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary/10 rounded-lg">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-[18px]">🥗</span>
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium">{stats.meals_completed} Meals Completed</p>
                <p className="text-[11px] text-muted-foreground">Nutrition on track!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
