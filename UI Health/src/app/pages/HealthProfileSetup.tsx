import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import apiClient from "../../services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AlertCircle, Loader } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";

export function HealthProfileSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    allergies: "",
    medical_conditions: "",
    diet_type: "vegetarian",
    daily_time_available: 60,
    workout_preference: "gym",
  });

  useEffect(() => {
    // Check if profile already exists
    const checkProfile = async () => {
      try {
        const response = await apiClient.getHealthProfile();
        if (response.data) {
          navigate("/");
        }
      } catch {
        // Profile doesn't exist, stay on setup
      }
    };
    checkProfile();
  }, [navigate]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiClient.createHealthProfile({
        ...formData,
        daily_time_available: parseInt(String(formData.daily_time_available)),
      });

      // Auto-generate plans after health profile is created
      const success = await generateInitialPlans();
      
      // Only navigate if both profile save and plan generation succeed
      if (success) {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to save health profile");
    } finally {
      setLoading(false);
    }
  };

  const generateInitialPlans = async (): Promise<boolean> => {
    try {
      console.log("Starting plan generation...");
      // Generate workout plan
      if (user) {
        console.log("Generating workout plan...");
        const workoutResponse = await apiClient.generateWorkoutPlan({
          goal: user.goal || "general_fitness",
          fitness_level: user.fitness_level || "beginner",
          workout_type: formData.workout_preference,
          time_available: formData.daily_time_available,
        });
        console.log("Workout plan generated:", workoutResponse);

        // Generate meal plan
        console.log("Generating meal plan...");
        const mealResponse = await apiClient.generateMealPlan({
          diet_type: formData.diet_type,
          calories: 2000,
        });
        console.log("Meal plan generated:", mealResponse);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Error generating plans:", err);
      const errorMsg = err.response?.data?.detail || err.message || "Failed to generate plans";
      setError(`Health profile saved, but plan generation failed: ${errorMsg}. You can regenerate plans from Settings after completing setup.`);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Health Profile</CardTitle>
          <CardDescription>
            This helps us personalize your workout and meal plans, {user?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Diet Type */}
            <div>
              <Label htmlFor="diet_type">Diet Type *</Label>
              <Select value={formData.diet_type} onValueChange={(value) => handleChange("diet_type", value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="non_vegetarian">Non-Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Allergies */}
            <div>
              <Label htmlFor="allergies">Allergies/Intolerances</Label>
              <Input
                id="allergies"
                placeholder="e.g., Dairy, Nuts, Shellfish (comma-separated)"
                value={formData.allergies}
                onChange={(e) => handleChange("allergies", e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Medical Conditions */}
            <div>
              <Label htmlFor="medical_conditions">Medical Conditions</Label>
              <Input
                id="medical_conditions"
                placeholder="e.g., High BP, Diabetes, Asthma"
                value={formData.medical_conditions}
                onChange={(e) => handleChange("medical_conditions", e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Daily Time Available */}
            <div>
              <Label htmlFor="daily_time_available">Time Available for Exercise (minutes) *</Label>
              <Input
                id="daily_time_available"
                type="number"
                min="15"
                max="180"
                value={formData.daily_time_available}
                onChange={(e) => handleChange("daily_time_available", e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Workout Preference */}
            <div>
              <Label htmlFor="workout_preference">Workout Preference *</Label>
              <Select value={formData.workout_preference} onValueChange={(value) => handleChange("workout_preference", value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gym">Gym</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Setting up your profile...
                </>
              ) : (
                "Complete Setup & Generate Plans"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
