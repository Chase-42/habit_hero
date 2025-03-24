export type HabitColor =
  | "red"
  | "green"
  | "blue"
  | "yellow"
  | "purple"
  | "pink"
  | "orange";

export type FrequencyType = "daily" | "weekly" | "monthly";

export type HabitCategory =
  | "fitness"
  | "nutrition"
  | "mindfulness"
  | "productivity"
  | "other";

export type FrequencyValue = {
  days?: number[];
  times?: number;
};

export type HabitDetails = Record<string, unknown>;

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
  reminderEnabled: boolean | null;
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
