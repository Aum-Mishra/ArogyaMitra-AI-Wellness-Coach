// src/hooks/useAuth.ts - Authentication Hook
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import apiClient from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  fitness_level: string;
  goal: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.getCurrentUser();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('accessToken');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.getCurrentUser();
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await apiClient.register(userData);
      localStorage.setItem('accessToken', response.data.access_token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      navigate('/');
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      localStorage.setItem('accessToken', response.data.access_token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      navigate('/');
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  return {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    refreshUser,
  };
}
