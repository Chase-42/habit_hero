import type { Habit, HabitLog } from "~/domain/models/habit";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface ApiHabit {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  category: string;
  color: string;
  frequencyType: string;
  frequencyValue: {
    days?: number[];
    times?: number;
  };
  streak: number;
  longestStreak: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isArchived: boolean;
  subCategory: string | null;
  lastCompleted: string | null;
  goal: number | null;
  metricType: string | null;
  units: string | null;
  notes: string | null;
  reminder: string | null;
  reminderEnabled: boolean;
}

export interface ApiHabitLog {
  id: string;
  habitId: string;
  userId: string;
  completedAt: string;
  value: number | null;
  notes: string | null;
  details: Record<string, unknown> | null;
  difficulty: number | null;
  feeling: string | null;
  hasPhoto: boolean;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ApiCreateHabitInput = Omit<
  Habit,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "streak"
  | "longestStreak"
  | "completedToday"
  | "lastCompletedAt"
  | "isArchived"
>;
export type ApiUpdateHabitInput = Partial<ApiCreateHabitInput>;
