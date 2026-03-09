import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { User, Heart, Activity, AlertCircle, Save, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../services/api";

export function HealthProfile() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  // User data (from User model)
  const [userData, setUserData] = useState({
    age: "",
    height: "",
    weight: "",
    gender: "female",
    fitness_level: "intermediate",
    goal: "weight_loss",
  });

  // Health profile data (from HealthProfile model)
  const [healthData, setHealthData] = useState({
    medical_conditions: "",
    allergies: "",
    diet_type: "vegetarian",
    daily_time_available: 60,
    workout_preference: "home",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch user data
        if (user) {
          setUserData({
            age: user.age?.toString() || "",
            height: user.height?.toString() || "",
            weight: user.weight?.toString() || "",
            gender: user.gender || "female",
            fitness_level: user.fitness_level || "intermediate",
            goal: user.goal || "weight_loss",
          });
        }

        // Fetch health profile
        try {
          const profile = await apiClient.getHealthProfile();
          if (profile.data || profile) {
            const profileData = profile.data || profile;
            setHealthData({
              medical_conditions: profileData.medical_conditions || "",
              allergies: profileData.allergies || "",
              diet_type: profileData.diet_type || "vegetarian",
              daily_time_available: profileData.daily_time_available || 60,
              workout_preference: profileData.workout_preference || "home",
            });
          }
        } catch (err) {
          // Health profile might not exist yet
          console.log("No existing health profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleUserDataChange = (field: string, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleHealthDataChange = (field: string, value: string | number) => {
    setHealthData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      // Update user info
      await apiClient.updateUser({
        age: parseInt(userData.age),
        height: parseFloat(userData.height),
        weight: parseFloat(userData.weight),
        gender: userData.gender,
        fitness_level: userData.fitness_level,
        goal: userData.goal,
      });

      // Create/update health profile
      await apiClient.createHealthProfile({
        medical_conditions: healthData.medical_conditions,
        allergies: healthData.allergies,
        diet_type: healthData.diet_type,
        daily_time_available: parseInt(String(healthData.daily_time_available)),
        workout_preference: healthData.workout_preference,
      });

      // Generate/update plans based on new profile
      await generateUpdatedPlans();

      // Refresh user context
      if (refreshUser) {
        await refreshUser();
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      setError(error.response?.data?.detail || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const generateUpdatedPlans = async () => {
    try {
      // Generate new workout plan
      await apiClient.generateWorkoutPlan({
        goal: userData.goal,
        fitness_level: userData.fitness_level,
        workout_type: healthData.workout_preference,
        time_available: healthData.daily_time_available,
      });

      // Generate new meal plan
      await apiClient.generateMealPlan({
        diet_type: healthData.diet_type,
        calories: calculateCalories(),
      });
    } catch (error) {
      console.error("Error generating plans:", error);
    }
  };

  const calculateCalories = () => {
    // Simple calorie calculation based on weight and activity
    const baseCalories = 1500;
    if (userData.weight) {
      return Math.round(baseCalories + (parseFloat(userData.weight) * 5));
    }
    return 2000;
  };

  const bmi = userData.weight && userData.height
    ? (parseFloat(userData.weight) / Math.pow(parseFloat(userData.height) / 100, 2)).toFixed(1)
    : "0";
  const idealWeight = userData.height
    ? (22 * Math.pow(parseFloat(userData.height) / 100, 2)).toFixed(1)
    : "0";

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your health profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 flex gap-2">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold">Health Profile</h1>
          <p className="text-muted-foreground text-[14px]">
            Manage your personal health information for personalized recommendations
          </p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-primary hover:bg-primary/90 gap-2"
          disabled={saved || saving}
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Saved! Plans Updated
            </>
          ) : saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving & Generating Plans...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save & Generate Plans
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <User className="w-5 h-5 text-primary" />
                Profile Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-3 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h3 className="font-semibold">{user?.name || "User"}</h3>
                <p className="text-[12px] text-muted-foreground">{user?.email}</p>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground">Age</span>
                  <span className="font-medium">{userData.age || "—"} years</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground">Height</span>
                  <span className="font-medium">{userData.height || "—"} cm</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-medium">{userData.weight || "—"} kg</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground">BMI</span>
                  <span className="font-medium">{bmi}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <Activity className="w-5 h-5 text-secondary" />
                Health Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-[12px] text-muted-foreground">BMI Status</p>
                <p className="text-[16px] font-semibold text-primary">
                  {bmi > 0 ? (bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese") : "—"}
                </p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-lg">
                <p className="text-[12px] text-muted-foreground">Ideal Weight</p>
                <p className="text-[16px] font-semibold text-secondary">{idealWeight} kg</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <p className="text-[12px] text-muted-foreground">Daily Calorie Target</p>
                <p className="text-[16px] font-semibold text-accent">{calculateCalories()} kcal</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your fundamental health metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={userData.age}
                    onChange={(e) => handleUserDataChange("age", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={userData.gender} onValueChange={(value) => handleUserDataChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={userData.height}
                    onChange={(e) => handleUserDataChange("height", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={userData.weight}
                    onChange={(e) => handleUserDataChange("weight", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fitness Information */}
          <Card>
            <CardHeader>
              <CardTitle>Fitness & Goals</CardTitle>
              <CardDescription>Your fitness level and objectives</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fitness_level">Current Fitness Level</Label>
                  <Select value={userData.fitness_level} onValueChange={(value) => handleUserDataChange("fitness_level", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal">Primary Goal</Label>
                  <Select value={userData.goal} onValueChange={(value) => handleUserDataChange("goal", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight_loss">Weight Loss</SelectItem>
                      <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                      <SelectItem value="general_fitness">General Fitness</SelectItem>
                      <SelectItem value="endurance">Build Endurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workout_preference">Workout Preference</Label>
                  <Select value={healthData.workout_preference} onValueChange={(value) => handleHealthDataChange("workout_preference", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home Workouts</SelectItem>
                      <SelectItem value="gym">Gym Training</SelectItem>
                      <SelectItem value="outdoor">Outdoor Activities</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diet_type">Diet Preference</Label>
                  <Select value={healthData.diet_type} onValueChange={(value) => handleHealthDataChange("diet_type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                      <SelectItem value="non_vegetarian">Non-Vegetarian</SelectItem>
                      <SelectItem value="keto">Keto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time & Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Time & Preferences</CardTitle>
              <CardDescription>Your schedule and availability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="daily_time_available">Time Available for Exercise (minutes/day)</Label>
                <Input
                  id="daily_time_available"
                  type="number"
                  value={healthData.daily_time_available}
                  onChange={(e) => handleHealthDataChange("daily_time_available", parseInt(e.target.value))}
                  min="15"
                  max="360"
                />
                <p className="text-[12px] text-muted-foreground">Recommended: 30-60 minutes</p>
              </div>
            </CardContent>
          </Card>

          {/* Health Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-destructive" />
                Health Conditions & Allergies
              </CardTitle>
              <CardDescription>Important medical information for personalized plans</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medical_conditions">Health Conditions</Label>
                <Textarea
                  id="medical_conditions"
                  placeholder="List any chronic conditions, injuries, or medical concerns..."
                  value={healthData.medical_conditions}
                  onChange={(e) => handleHealthDataChange("medical_conditions", e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-[12px] text-muted-foreground">
                  e.g., Diabetes, Hypertension, Knee injury, etc.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Food Allergies & Intolerances</Label>
                <Textarea
                  id="allergies"
                  placeholder="List any food allergies or intolerances..."
                  value={healthData.allergies}
                  onChange={(e) => handleHealthDataChange("allergies", e.target.value)}
                  className="min-h-[80px]"
                />
                <p className="text-[12px] text-muted-foreground">
                  e.g., Dairy, Gluten, Nuts, Shellfish, etc.
                </p>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-amber-800">
                  This information helps AROMI provide safe and personalized recommendations. Always consult with healthcare professionals before starting any new fitness or nutrition program.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
