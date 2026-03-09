import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layout/RootLayout";
import { Dashboard } from "./pages/Dashboard";
import { WorkoutPlan } from "./pages/WorkoutPlan";
import { MealPlan } from "./pages/MealPlan";
import { AICoach } from "./pages/AICoach";
import { Progress } from "./pages/Progress";
import { HealthProfile } from "./pages/HealthProfile";
import { HealthProfileSetup } from "./pages/HealthProfileSetup";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  // Login & Register (Public routes)
  { path: "/login", Component: Login },
  { path: "/register", Component: Register },

  // Health Profile Setup (First-time only)
  { path: "/health-profile-setup", Component: HealthProfileSetup },

  // Protected Dashboard Routes
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: () => <ProtectedRoute component={Dashboard} /> },
      { path: "workout", Component: () => <ProtectedRoute component={WorkoutPlan} /> },
      { path: "meals", Component: () => <ProtectedRoute component={MealPlan} /> },
      { path: "coach", Component: () => <ProtectedRoute component={AICoach} /> },
      { path: "progress", Component: () => <ProtectedRoute component={Progress} /> },
      { path: "profile", Component: () => <ProtectedRoute component={HealthProfile} /> },
      { path: "settings", Component: () => <ProtectedRoute component={Settings} /> },
    ],
  },
]);
