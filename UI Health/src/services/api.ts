// src/services/api.ts - API Client Configuration
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(userData: {
    name: string;
    email: string;
    password: string;
    age: number;
    gender: string;
    height: number;
    weight: number;
    fitness_level?: string;
    goal?: string;
  }) {
    return this.client.post('/auth/register', userData);
  }

  async login(email: string, password: string) {
    return this.client.post('/auth/login', {
      email,
      password,
    });
  }

  // User endpoints
  async getCurrentUser() {
    const token = localStorage.getItem('accessToken');
    return this.client.get('/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async updateUser(userData: any) {
    const token = localStorage.getItem('accessToken');
    return this.client.put('/users/me', userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async createHealthProfile(profileData: any) {
    const token = localStorage.getItem('accessToken');
    return this.client.post('/users/health-profile', profileData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getHealthProfile() {
    const token = localStorage.getItem('accessToken');
    return this.client.get('/users/health-profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Workout endpoints
  async generateWorkoutPlan(planData: {
    goal: string;
    fitness_level: string;
    workout_type: string;
    time_available: number;
  }) {
    const token = localStorage.getItem('accessToken');
    return this.client.post('/workouts/generate-plan', planData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getWorkoutPlan() {
    const token = localStorage.getItem('accessToken');
    console.log("[API] getWorkoutPlan called with token:", !!token);
    try {
      const response = await this.client.get('/workouts/my-plan', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("[API] getWorkoutPlan response:", response);
      return response;
    } catch (error: any) {
      console.error("[API] getWorkoutPlan error:", error.response?.status, error.response?.data?.detail);
      throw error;
    }
  }

  async completeExercise(exerciseData: {
    exercise: string;
    day: number;
    completed: boolean;
  }) {
    const token = localStorage.getItem('accessToken');
    return this.client.post('/workouts/complete-exercise', exerciseData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getWorkoutProgress() {
    const token = localStorage.getItem('accessToken');
    return this.client.get('/workouts/progress', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async adjustWorkoutPlan(adjustmentData: {
    constraint: string;
    reason: string;
  }) {
    const token = localStorage.getItem('accessToken');
    return this.client.post('/workouts/adjust-plan', adjustmentData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Meal endpoints
  async generateMealPlan(planData: {
    diet_type: string;
    calories: number;
    number_of_days?: number;
  }) {
    const token = localStorage.getItem('accessToken');
    return this.client.post('/meals/generate-plan', planData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getMealPlan() {
    const token = localStorage.getItem('accessToken');
    console.log("[API] getMealPlan called with token:", !!token);
    try {
      const response = await this.client.get('/meals/my-plan', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("[API] getMealPlan response:", response);
      return response;
    } catch (error: any) {
      console.error("[API] getMealPlan error:", error.response?.status, error.response?.data?.detail);
      throw error;
    }
  }

  async completeMeal(mealData: {
    meal_name: string;
    completed: boolean;
  }) {
    const token = localStorage.getItem('accessToken');
    return this.client.post('/meals/complete-meal', mealData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getMealProgress() {
    const token = localStorage.getItem('accessToken');
    return this.client.get('/meals/progress', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // AROMI Chat endpoints
  async sendAromicMessage(message: string) {
    const token = localStorage.getItem('accessToken');
    return this.client.post(
      '/aromi/chat',
      { message },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }

  async applyAromicAdjustment(adjustmentData: {
    constraint: string;
    reason?: string;
  }) {
    const token = localStorage.getItem('accessToken');
    return this.client.post('/aromi/apply-adjustment', adjustmentData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getAromicSuggestions() {
    const token = localStorage.getItem('accessToken');
    return this.client.get('/aromi/suggestions', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Dashboard endpoints
  async getDashboardSummary() {
    const token = localStorage.getItem('accessToken');
    return this.client.get('/dashboard/summary', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getWeeklyStats() {
    const token = localStorage.getItem('accessToken');
    return this.client.get('/dashboard/weekly-stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async logProgress(progressData: any) {
    const token = localStorage.getItem('accessToken');
    return this.client.post('/dashboard/log-progress', progressData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

export const apiClient = new APIClient();
export default apiClient;
