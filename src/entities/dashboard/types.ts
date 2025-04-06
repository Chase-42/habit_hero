import type { Habit, HabitLog } from "~/types";

export interface DashboardStats {
  totalHabits: number;
  completedToday: number;
  weeklyProgress: number;
  currentStreak: number;
}

export interface DashboardState {
  habits: Habit[];
  habitLogs: HabitLog[];
  isLoading: boolean;
  error: DashboardError | null;
}

export interface DashboardFilters {
  startDate: Date;
  endDate: Date;
  showArchived: boolean;
}
