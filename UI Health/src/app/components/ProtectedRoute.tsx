import { Navigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useState, useEffect } from "react";
import apiClient from "../../services/api";

interface ProtectedRouteProps {
  component: React.ComponentType;
}

export function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const [hasHealthProfile, setHasHealthProfile] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkHealthProfile = async () => {
      if (!isAuthenticated) {
        setCheckingProfile(false);
        return;
      }

      try {
        await apiClient.getHealthProfile();
        setHasHealthProfile(true);
      } catch {
        setHasHealthProfile(false);
      } finally {
        setCheckingProfile(false);
      }
    };

    checkHealthProfile();
  }, [isAuthenticated]);

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If health profile doesn't exist, redirect to setup
  if (hasHealthProfile === false) {
    return <Navigate to="/health-profile-setup" replace />;
  }

  return <Component />;
}
