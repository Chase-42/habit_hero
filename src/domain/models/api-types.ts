import type { Habit, HabitLog } from "./habit-types";

/**
 * API response wrapper type
 */
export interface ApiResponse<T> {
  data: T;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * API version of Habit type (with string dates)
 */
export type ApiHabit = Omit<
  Habit,
  "lastCompleted" | "createdAt" | "updatedAt"
> & {
  lastCompleted: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * API version of HabitLog type (with string dates)
 */
export type ApiHabitLog = Omit<
  HabitLog,
  "completedAt" | "createdAt" | "updatedAt"
> & {
  completedAt: string;
  createdAt: string;
  updatedAt: string;
};
