export type HabitColor = "red" | "green" | "blue" | "yellow" | "purple" | "pink" | "orange";

export type HabitCategory = "fitness" | "nutrition" | "mindfulness" | "productivity" | "other";

export type FrequencyType = "daily" | "weekly" | "monthly";

export type FrequencyValue = {
  days?: number[]; // 0-6 for weekly (0 = Sunday)
  times?: number;  // X times per period
};

export type HabitDetails = {
  duration?: number;    // in minutes
  distance?: number;    // in specified units
  sets?: number;
  reps?: number;
  weight?: number;     // in specified units
  intensity?: number;  // 1-10 scale
  customFields?: Record<string, string | number | boolean>;
};

export type RelatedHabits = {
  habitIds: string[];
  relationship: "supports" | "conflicts" | "prerequisite";
  notes?: string;
};

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: HabitColor;
  frequencyType: FrequencyType;
  frequencyValue: FrequencyValue;
  category: HabitCategory;
  subCategory: string | null;
  streak: number;
  longestStreak: number;
  lastCompleted: Date | null;
  goal: number | null;
  metricType: string | null;
  units: string | null;
  notes: string | null;
  reminder: Date | null;
  reminderEnabled: boolean | null;
  isActive: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  completedAt: Date;
  value: number | null;
  notes: string | null;
  details: HabitDetails | null;
  difficulty: number | null;
  feeling: string | null;
  hasPhoto: boolean;
  photoUrl: string | null;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetDate?: Date;
  isCompleted?: boolean;
  category?: string;
  metricType?: string;
  startValue?: number;
  currentValue?: number;
  targetValue?: number;
  units?: string;
  relatedHabits?: RelatedHabits[];
  createdAt?: Date;
  updatedAt?: Date;
}

 