import { useState } from "react";
import { Checkbox } from "../ui/checkbox";

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export function CircularProgress({
  value,
  max,
  size = 80,
  strokeWidth = 8,
  color = "#10b981",
  label,
}: CircularProgressProps) {
  const percentage = (value / max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[14px] font-semibold">{value}</span>
        {label && <span className="text-[10px] text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}

interface WorkoutItemProps {
  exercise: string;
  details: string;
  completed: boolean;
  onToggle: () => void;
  showVideo?: boolean;
}

export function WorkoutItem({
  exercise,
  details,
  completed,
  onToggle,
  showVideo = false,
}: WorkoutItemProps) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        completed
          ? "bg-primary/5 border-primary/20"
          : "bg-white border-border hover:border-primary/40"
      }`}
    >
      <Checkbox checked={completed} onCheckedChange={onToggle} />
      <div className="flex-1">
        <p
          className={`text-[14px] font-medium ${
            completed ? "line-through text-muted-foreground" : ""
          }`}
        >
          {exercise}
        </p>
        <p className="text-[12px] text-muted-foreground">{details}</p>
      </div>
      {showVideo && (
        <button className="text-[12px] text-secondary hover:text-secondary/80 flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
          Watch
        </button>
      )}
    </div>
  );
}

interface MealItemProps {
  meal: string;
  description: string;
  calories: number;
  completed: boolean;
  onToggle: () => void;
}

export function MealItem({
  meal,
  description,
  calories,
  completed,
  onToggle,
}: MealItemProps) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        completed
          ? "bg-primary/5 border-primary/20"
          : "bg-white border-border hover:border-primary/40"
      }`}
    >
      <Checkbox checked={completed} onCheckedChange={onToggle} />
      <div className="flex-1">
        <p
          className={`text-[14px] font-medium ${
            completed ? "line-through text-muted-foreground" : ""
          }`}
        >
          {meal}
        </p>
        <p className="text-[12px] text-muted-foreground">{description}</p>
      </div>
      <div className="px-2 py-1 bg-accent/10 text-accent rounded text-[12px] font-medium">
        {calories} kcal
      </div>
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
}

export function ProgressBar({
  value,
  max,
  label,
  showPercentage = true,
  color = "bg-primary",
}: ProgressBarProps) {
  const percentage = Math.min(100, (value / max) * 100);

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-muted-foreground">{label}</span>
          {showPercentage && (
            <span className="font-medium">
              {value} / {max}
            </span>
          )}
        </div>
      )}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
