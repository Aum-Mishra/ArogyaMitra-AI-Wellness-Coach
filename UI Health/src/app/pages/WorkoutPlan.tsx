import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { WorkoutItem } from "../components/shared/ProgressComponents";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { CheckCircle2, Calendar, Trophy, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../services/api";

interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  duration?: string;
  completed?: boolean;
}

interface DayWorkout {
  day: number;
  exercises: Exercise[];
}

export function WorkoutPlan() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<DayWorkout[]>([]);
  const [workoutCompletions, setWorkoutCompletions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      try {
        setLoading(true);
        console.log("[WorkoutPlan] Fetching workout plan for user:", user?.id);
        
        const response = await apiClient.getWorkoutPlan();
        console.log("[WorkoutPlan] Raw API response:", response);
        
        const plan = response.data || response;
        console.log("[WorkoutPlan] Extracted plan object:", plan);
        console.log("[WorkoutPlan] Plan has 'plan' field:", !!plan?.plan);
        console.log("[WorkoutPlan] Plan has 'plan_json' field:", !!plan?.plan_json);
        
        if (plan && (plan.plan || plan.plan_json)) {
          let planData;
          if (plan.plan) {
            planData = plan.plan;
            console.log("[WorkoutPlan] Using plan.plan field");
          } else if (typeof plan.plan_json === 'string') {
            planData = JSON.parse(plan.plan_json);
            console.log("[WorkoutPlan] Parsed plan.plan_json (was string)");
          } else {
            planData = plan.plan_json;
            console.log("[WorkoutPlan] Using plan.plan_json directly");
          }
          
          console.log("[WorkoutPlan] Parsed plan data:", planData);
          console.log("[WorkoutPlan] Available fields:", Object.keys(planData));

          // The LLM returns { plan: [...], summary: "..." } or { plan: [...] }
          const dailyWorkouts = planData.plan || planData.daily_workout || [];
          console.log("[WorkoutPlan] Processing", dailyWorkouts.length, "days");
          
          const formatted = dailyWorkouts.map((day: any, idx: number) => {
            // Each day from LLM has: { day, date, warmup, exercises: [...], cooldown, youtube_link, tip }
            // exercises array already has the format we need: { name, sets, reps, rest }
            console.log(`[WorkoutPlan] Day ${idx + 1}:`, day.exercises?.length || 0, "exercises");
            return {
              day: idx + 1,
              exercises: day.exercises || [],
            };
          });

          console.log("[WorkoutPlan] Formatted workouts:", formatted);
          setWeeklyWorkouts(formatted);

          // Initialize completion tracking
          const initialCompletions: Record<string, boolean> = {};
          formatted.forEach((day: DayWorkout) => {
            day.exercises.forEach((ex: Exercise, exIdx: number) => {
              initialCompletions[`${day.day}-${exIdx}`] = false;
            });
          });
          setWorkoutCompletions(initialCompletions);
          console.log("[WorkoutPlan] Successfully set workouts state with", formatted.length, "days");
        } else {
          const errorMsg = "Invalid plan structure. Plan data not found. Please generate a new workout plan.";
          console.error("[WorkoutPlan] Invalid plan structure:");
          console.error("  - plan exists:", !!plan);
          console.error("  - plan.plan exists:", !!plan?.plan);
          console.error("  - plan.plan_json exists:", !!plan?.plan_json);
          console.error("  - Full plan object:", plan);
          setError(errorMsg);
        }
      } catch (error: any) {
        const errorMsg = `Failed to fetch workout plan: ${error.response?.status === 404 ? 'Not found - generate a new plan' : error.response?.data?.detail || error.message}`;
        console.error("[WorkoutPlan] Error fetching workout plan:", error);
        console.error("[WorkoutPlan] Error status:", error.response?.status);
        console.error("[WorkoutPlan] Error message:", error.response?.data?.detail || error.message);
        console.error("[WorkoutPlan] Full error:", error);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchWorkoutPlan();
    }
  }, [user]);

  const toggleExercise = async (dayNum: number, exIdx: number) => {
    const key = `${dayNum}-${exIdx}`;
    setWorkoutCompletions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    try {
      await apiClient.completeExercise({
        exercise: weeklyWorkouts[dayNum - 1]?.exercises[exIdx]?.name || `Exercise ${exIdx}`,
        day: dayNum,
        completed: !workoutCompletions[key],
      });
    } catch (error) {
      console.error("Error updating workout completion:", error);
    }
  };

  const getDayCompletion = (dayNum: number) => {
    const day = weeklyWorkouts[dayNum - 1];
    if (!day) return { completed: 0, total: 0 };
    const completed = day.exercises.filter(
      (_, idx) => workoutCompletions[`${dayNum}-${idx}`]
    ).length;
    return { completed, total: day.exercises.length };
  };

  const totalCompleted = Object.values(workoutCompletions).filter(Boolean).length;
  const totalExercises = weeklyWorkouts.reduce((sum, day) => sum + day.exercises.length, 0);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your workout plan...</p>
        </div>
      </div>
    );
  }

  if (weeklyWorkouts.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            {error ? (
              <>
                <p className="text-red-500 mb-2 font-medium">❌ {error}</p>
                <p className="text-sm text-muted-foreground">Go to Settings and click "Regenerate Plans" to create a new workout plan.</p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-2">No workout plan generated yet.</p>
                <p className="text-sm text-muted-foreground">Complete your health profile setup to get a personalized workout plan!</p>
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
          <h1 className="text-[24px] font-semibold">Your Workout Plan</h1>
          <p className="text-muted-foreground text-[14px]">
            AI-generated plan tailored to your fitness level and goals
          </p>
        </div>
        <Card className="md:w-auto bg-gradient-to-br from-primary to-secondary text-white border-none">
          <CardContent className="p-4 flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            <div>
              <p className="text-[20px] font-semibold">
                {totalCompleted} / {totalExercises}
              </p>
              <p className="text-[12px] opacity-90">Exercises Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Weekly Overview
          </CardTitle>
          <CardDescription>Track your progress across the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weeklyWorkouts.map((day) => {
              const { completed, total } = getDayCompletion(day.day);
              const isCompleted = total > 0 && completed === total;
              return (
                <div
                  key={day.day}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isCompleted
                      ? "bg-primary/10 border-primary"
                      : "bg-white border-border hover:border-primary/40"
                  }`}
                >
                  <div className="text-center">
                    <p className="text-[11px] text-muted-foreground font-medium">Day {day.day}</p>
                    {isCompleted && <CheckCircle2 className="w-6 h-6 text-primary mx-auto mt-1" />}
                    {!isCompleted && total > 0 && (
                      <div className="mt-1">
                        <p className="text-[16px] font-semibold">{completed}</p>
                        <p className="text-[10px] text-muted-foreground">/{total}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Workout Days */}
      {weeklyWorkouts.length > 0 && (
        <Tabs defaultValue="1" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
            {weeklyWorkouts.map((day) => {
              const { completed, total } = getDayCompletion(day.day);
              const isCompleted = total > 0 && completed === total;
              return (
                <TabsTrigger key={day.day} value={day.day.toString()} className="relative">
                  Day {day.day}
                  {isCompleted && (
                    <CheckCircle2 className="w-4 h-4 text-primary absolute -top-1 -right-1" />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {weeklyWorkouts.map((day) => {
            const { completed, total } = getDayCompletion(day.day);
            const isCompleted = total > 0 && completed === total;
            return (
              <TabsContent key={day.day} value={day.day.toString()} className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-[18px]">Day {day.day} Workout</CardTitle>
                        <CardDescription>
                          {day.exercises.length} exercises
                        </CardDescription>
                      </div>
                      <Badge
                        variant={isCompleted ? "default" : "secondary"}
                        className={isCompleted ? "bg-primary" : ""}
                      >
                        {completed} / {total} Complete
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {day.exercises.map((exercise, exIdx) => {
                      const key = `${day.day}-${exIdx}`;
                      const details = exercise.sets && exercise.reps
                        ? `${exercise.sets} sets × ${exercise.reps} reps`
                        : exercise.duration || "";
                      return (
                        <WorkoutItem
                          key={key}
                          exercise={exercise.name || `Exercise ${exIdx + 1}`}
                          details={details}
                          completed={!!workoutCompletions[key]}
                          onToggle={() => toggleExercise(day.day, exIdx)}
                          showVideo
                        />
                      );
                    })}

                    {isCompleted && (
                      <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-primary">Day {day.day} Complete!</p>
                          <p className="text-[13px] text-muted-foreground">
                            Great job! Keep up the momentum.
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
