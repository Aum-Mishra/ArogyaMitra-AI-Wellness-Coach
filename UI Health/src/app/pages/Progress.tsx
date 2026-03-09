import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { TrendingUp, TrendingDown, Flame, Target, Award, Calendar, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../services/api";

interface DashboardSummary {
  user: {
    name: string;
    weight: number;
    goal: string;
  };
  today: {
    calories_consumed: number;
    calories_goal: number;
    water_intake: number;
    steps: number;
    workout_completed: boolean;
  };
  progress: {
    workouts_completed: number;
    workouts_total: number;
    workouts_percentage: number;
    meals_completed: number;
    meals_total: number;
    meals_percentage: number;
  };
  stats: {
    weekly_workouts: number;
    weekly_meals: number;
    streak_days: number;
    total_progress: number;
  };
}

const achievements = [
  { icon: "🏅", title: "7 Day Streak", description: "Completed workouts for 7 consecutive days", color: "bg-accent" },
  { icon: "💪", title: "10 Workouts", description: "Finished 10 workout sessions", color: "bg-primary" },
  { icon: "🥗", title: "5 Healthy Days", description: "Stayed within calorie goals for 5 days", color: "bg-secondary" },
  { icon: "🎯", title: "Goal Weight", description: "Reached your target weight", color: "bg-destructive" },
  { icon: "⚡", title: "5000 Calories", description: "Burned 5000 calories this week", color: "bg-chart-4" },
  { icon: "📈", title: "30 Day Active", description: "Logged activity for 30 days", color: "bg-chart-5" },
];

export function Progress() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch dashboard summary
        const summaryResponse = await apiClient.getDashboardSummary();
        setDashboardData(summaryResponse.data || summaryResponse);

        // Fetch weekly stats
        const weeklyResponse = await apiClient.getWeeklyStats();
        setWeeklyData(weeklyResponse.data?.weekly_stats || []);
      } catch (err: any) {
        console.error("Error fetching progress data:", err);
        setError("Failed to load progress data");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProgressData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-destructive font-medium mb-2">Error</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const currentWeight = dashboardData.user.weight;
  const weightData = weeklyData.map((item) => ({
    week: item.day,
    weight: item.weight || currentWeight,
    goal: currentWeight - (weeklyData.length - weeklyData.indexOf(item)) * 0.5,
  }));

  const caloriesData = weeklyData.map((item) => ({
    date: item.day,
    burned: item.calories_burned || 420,
    consumed: item.calories_consumed || 1800,
    target: dashboardData.today.calories_goal,
  }));

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-semibold">Progress Tracking</h1>
        <p className="text-muted-foreground text-[14px]">
          Monitor your fitness journey and celebrate your achievements
        </p>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-2">
          <p className="text-[13px] text-amber-800">{error}</p>
        </div>
      )}

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary to-primary/70 text-white border-none">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] opacity-90">Today's Progress</p>
                <p className="text-[28px] font-semibold mt-1">{dashboardData.stats.total_progress.toFixed(0)}%</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[12px]">Overall completion rate</span>
                </div>
              </div>
              <Target className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent to-accent/70 text-white border-none">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] opacity-90">Workouts Done</p>
                <p className="text-[28px] font-semibold mt-1">
                  {dashboardData.progress.workouts_completed}/{dashboardData.progress.workouts_total}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Award className="w-4 h-4" />
                  <span className="text-[12px]">{dashboardData.progress.workouts_percentage.toFixed(0)}% complete</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary to-secondary/70 text-white border-none">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] opacity-90">Meals Tracked</p>
                <p className="text-[28px] font-semibold mt-1">
                  {dashboardData.progress.meals_completed}/{dashboardData.progress.meals_total}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[12px]">{dashboardData.progress.meals_percentage.toFixed(0)}% complete</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive to-destructive/70 text-white border-none">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] opacity-90">Current Streak</p>
                <p className="text-[28px] font-semibold mt-1">{dashboardData.stats.streak_days} days</p>
                <div className="flex items-center gap-1 mt-2">
                  <Flame className="w-4 h-4" />
                  <span className="text-[12px]">Keep it up!</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calories Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Calories</CardTitle>
            <CardDescription>Consumed vs Target</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Consumed</span>
                  <span className="font-semibold">{dashboardData.today.calories_consumed} kcal</span>
                </div>
                <div className="w-full bg-grey rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        (dashboardData.today.calories_consumed / dashboardData.today.calories_goal) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Goal</span>
                <span className="font-semibold">{dashboardData.today.calories_goal} kcal</span>
              </div>
              <Badge variant="secondary">
                {Math.abs(
                  dashboardData.today.calories_goal - dashboardData.today.calories_consumed
                ).toFixed(0)}{" kcal"} remaining</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Water Intake */}
        <Card>
          <CardHeader>
            <CardTitle>Hydration Status</CardTitle>
            <CardDescription>Daily water intake</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Glasses consumed</span>
                  <span className="font-semibold">{dashboardData.today.water_intake} / 8</span>
                </div>
                <div className="w-full bg-grey rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        (dashboardData.today.water_intake / 8) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <Badge variant="secondary">{Math.max(0, 8 - dashboardData.today.water_intake)} glasses to go</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Overview Charts */}
      {caloriesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Calories Overview</CardTitle>
            <CardDescription>Consumed, burned, and target comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={caloriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="consumed" fillOpacity={1} fill="#f59e0b" name="Consumed" />
                <Bar dataKey="burned" fillOpacity={1} fill="#10b981" name="Burned" />
                <Bar dataKey="target" fillOpacity={0.3} fill="#6b7280" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-accent" />
            Recent Achievements
          </CardTitle>
          <CardDescription>Keep pushing to unlock more achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, idx) => (
              <div key={idx} className={`${achievement.color} p-4 rounded-lg text-white`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm">{achievement.title}</h3>
                    <p className="text-xs/relaxed opacity-90">{achievement.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
