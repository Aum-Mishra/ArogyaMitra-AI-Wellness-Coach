import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { Switch } from "../components/ui/switch";
import { Bell, Lock, Palette, User, Shield, LogOut, CheckCircle2, Loader2, Zap, Sun, Moon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../services/api";

export function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [generatingPlans, setGeneratingPlans] = useState(false);
  const [planGenerationSuccess, setPlanGenerationSuccess] = useState(false);

  const [accountData, setAccountData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
  });

  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    mealReminders: true,
    progressUpdates: true,
    achievements: true,
    weeklyReports: false,
  });

  const [preferences, setPreferences] = useState({
    theme: "light",
    language: "en",
    units: "metric",
    timezone: "asia-kolkata",
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        if (user) {
          setAccountData({
            name: user.name || "",
            email: user.email || "",
            phone: "",
            dob: "",
          });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadUserData();
    }
  }, [user]);

  const handleAccountChange = (field: string, value: string) => {
    setAccountData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAccount = async () => {
    try {
      setSaving(true);
      setError("");
      const updatePayload: any = {
        name: accountData.name,
      };
      
      // Only include fields that are not empty
      if (accountData.dob) updatePayload.dob = accountData.dob;
      if (accountData.phone) updatePayload.phone = accountData.phone;
      
      await apiClient.updateUser(updatePayload);
      
      // Reload user data to reflect changes
      const updatedUser = await apiClient.getCurrentUser();
      if (updatedUser.data) {
        setAccountData({
          name: updatedUser.data.name || "",
          email: updatedUser.data.email || "",
          phone: updatedUser.data.phone || "",
          dob: updatedUser.data.dob || "",
        });
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to save account settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleRegeneratePlans = async () => {
    try {
      setGeneratingPlans(true);
      setError("");
      setPlanGenerationSuccess(false);

      // Get health profile to ensure it exists
      const profileResponse = await apiClient.getHealthProfile();
      const healthProfile = profileResponse.data || profileResponse;
      
      if (!user) {
        setError("User information not available");
        return;
      }

      console.log("Generating workout plan with data:", { goal: user.goal, fitness_level: user.fitness_level });
      // Generate workout plan
      await apiClient.generateWorkoutPlan({
        goal: user.goal || "general_fitness",
        fitness_level: user.fitness_level || "beginner",
        workout_type: healthProfile.workout_preference || "gym",
        time_available: healthProfile.daily_time_available || 60,
      });

      console.log("Generating meal plan with data:", { diet_type: healthProfile.diet_type });
      // Generate meal plan
      await apiClient.generateMealPlan({
        diet_type: healthProfile.diet_type || "vegetarian",
        calories: 2000,
      });

      setPlanGenerationSuccess(true);
      setTimeout(() => setPlanGenerationSuccess(false), 5000);
    } catch (err: any) {
      console.error("Error regenerating plans:", err);
      const errorMsg = err.response?.data?.detail || err.message || "Failed to generate plans. Please ensure your health profile is complete.";
      setError(errorMsg);
    } finally {
      setGeneratingPlans(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1000px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-semibold">Settings</h1>
        <p className="text-muted-foreground text-[14px]">
          Manage your account preferences and app settings
        </p>
      </div>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Account Settings
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={accountData.name}
                onChange={(e) => handleAccountChange("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={accountData.email}
                disabled
                className="opacity-75"
              />
              <p className="text-[11px] text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={accountData.phone}
                onChange={(e) => handleAccountChange("phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={accountData.dob}
                onChange={(e) => handleAccountChange("dob", e.target.value)}
              />
            </div>
          </div>
          <Separator />
          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={handleSaveAccount}
              disabled={saved || saving}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Saved!
                </>
              ) : saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-secondary" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose what notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Workout Reminders</Label>
              <p className="text-[12px] text-muted-foreground">
                Get notified when it's time for your workout
              </p>
            </div>
            <Switch
              checked={notifications.workoutReminders}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, workoutReminders: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Meal Reminders</Label>
              <p className="text-[12px] text-muted-foreground">
                Reminders to log your meals and stay on track
              </p>
            </div>
            <Switch
              checked={notifications.mealReminders}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, mealReminders: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Progress Updates</Label>
              <p className="text-[12px] text-muted-foreground">
                Daily and weekly progress summaries
              </p>
            </div>
            <Switch
              checked={notifications.progressUpdates}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, progressUpdates: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Achievement Alerts</Label>
              <p className="text-[12px] text-muted-foreground">
                Celebrate when you unlock new achievements
              </p>
            </div>
            <Switch
              checked={notifications.achievements}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, achievements: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Reports</Label>
              <p className="text-[12px] text-muted-foreground">
                Comprehensive weekly wellness reports
              </p>
            </div>
            <Switch
              checked={notifications.weeklyReports}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, weeklyReports: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance & Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-accent" />
            Appearance & Preferences
          </CardTitle>
          <CardDescription>Customize your app experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={preferences.theme}
                onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => setPreferences({ ...preferences, language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="units">Unit System</Label>
              <Select
                value={preferences.units}
                onValueChange={(value) => setPreferences({ ...preferences, units: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                  <SelectItem value="imperial">Imperial (lb, in)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={preferences.timezone}
                onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asia-kolkata">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="america-new-york">America/New York (EST)</SelectItem>
                  <SelectItem value="europe-london">Europe/London (GMT)</SelectItem>
                  <SelectItem value="asia-tokyo">Asia/Tokyo (JST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-secondary" />
            Generate Your Plans
          </CardTitle>
          <CardDescription>Create or regenerate your personalized workout and meal plans</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {planGenerationSuccess && (
            <div className="bg-accent/10 border border-accent rounded-lg p-3 text-sm text-accent flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Plans generated successfully! Check your Meal Plan and Workout Plan pages.</span>
            </div>
          )}
          <div>
            <h4 className="font-semibold mb-2">What this does:</h4>
            <ul className="text-[13px] text-muted-foreground space-y-1">
              <li>✓ Creates a personalized 7-day workout plan based on your fitness level and goals</li>
              <li>✓ Generates a customized meal plan matching your dietary preferences</li>
              <li>✓ Takes into account your available time and health conditions</li>
              <li>✓ Replaces any existing plans with fresh, updated versions</li>
            </ul>
          </div>
          <Separator />
          <Button
            className="w-full bg-secondary hover:bg-secondary/90 gap-2"
            onClick={handleRegeneratePlans}
            disabled={generatingPlans}
          >
            {generatingPlans ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Plans...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate Workout & Meal Plans
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-destructive" />
            Privacy & Security
          </CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start gap-2">
            <Lock className="w-4 h-4" />
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2">
            <Shield className="w-4 h-4" />
            Two-Factor Authentication
          </Button>
          <Separator />
          <div className="space-y-2">
            <Label>Data & Privacy</Label>
            <p className="text-[12px] text-muted-foreground">
              Your health data is encrypted and stored securely. We never share your personal information without your consent.
            </p>
            <div className="flex gap-2 pt-2">
              <Button variant="link" className="h-auto p-0 text-[12px]">
                Privacy Policy
              </Button>
              <span className="text-muted-foreground">•</span>
              <Button variant="link" className="h-auto p-0 text-[12px]">
                Terms of Service
              </Button>
              <span className="text-muted-foreground">•</span>
              <Button variant="link" className="h-auto p-0 text-[12px]">
                Data Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>Manage your premium membership</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Premium Plan</h3>
                <p className="text-[12px] text-muted-foreground">Active until March 8, 2027</p>
              </div>
              <div className="text-right">
                <p className="text-[20px] font-semibold text-primary">₹499</p>
                <p className="text-[11px] text-muted-foreground">per month</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">Cancel Subscription</Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90">Upgrade Plan</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible account actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2 text-destructive border-destructive/50 hover:bg-destructive/10">
            Delete Account
          </Button>
          <p className="text-[11px] text-muted-foreground">
            Warning: Deleting your account will permanently remove all your data and cannot be undone.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
