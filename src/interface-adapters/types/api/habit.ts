import {
  type HabitCategory,
  type HabitColor,
  type FrequencyType,
} from "~/domain/enums";
import type { Habit } from "~/domain/entities/habit";

export interface ApiHabit {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  category: HabitCategory;
  color: HabitColor;
  frequencyType: FrequencyType;
  frequencyValue: number;
  isActive: boolean;
  isArchived: boolean;
  streak: number;
  longestStreak: number;
  lastCompleted: string | null;
  subCategory: string | null;
  goal: number | null;
  metricType: string | null;
  units: string | null;
  notes: string | null;
  reminder: string | null;
  reminderEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewHabit {
  userId: string;
  name: string;
  description?: string | null;
  category: HabitCategory;
  color: HabitColor;
  frequencyType: FrequencyType;
  frequencyValue: number;
  subCategory?: string | null;
  goal?: number | null;
  metricType?: string | null;
  units?: string | null;
  notes?: string | null;
  reminder?: string | null;
  reminderEnabled?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}
