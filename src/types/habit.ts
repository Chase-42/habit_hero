import type { FrequencyValue } from "./common";
import type { HabitColor, HabitCategory, FrequencyType } from "./common/enums";

export interface Habit {
  id: string;
  userId: string;
  name: string;
  color: HabitColor;
  frequencyType: FrequencyType;
  frequencyValue: FrequencyValue;
  category: HabitCategory;
  streak: number;
  longestStreak: number;
  isActive: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  description: string | null;
  subCategory: string | null;
  lastCompleted: Date | null;
  goal: number | null;
  metricType: string | null;
  units: string | null;
  notes: string | null;
  reminder: Date | null;
  reminderEnabled: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  completedAt: Date;
  value: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitFilters {
  userId: string;
  isActive?: boolean;
  isArchived?: boolean;
  category?: HabitCategory;
  searchQuery?: string;
  sortBy?: "name" | "createdAt" | "category";
  sortOrder?: "asc" | "desc";
}
