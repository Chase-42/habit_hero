import type { FrequencyValue } from "../utils/frequency";
import type { HabitColor, HabitCategory, FrequencyType } from "../enums";

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
  complete: (completedAt?: Date) => Habit;
  update: (params: {
    name?: string;
    description?: string;
    category?: HabitCategory;
    color?: HabitColor;
    frequencyType?: FrequencyType;
    frequencyValue?: FrequencyValue;
    subCategory?: string;
    goal?: number;
    metricType?: string;
    units?: string;
    notes?: string;
    reminder?: Date;
    reminderEnabled?: boolean;
    isActive?: boolean;
    isArchived?: boolean;
  }) => Habit;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  completedAt: Date;
  value: number | null;
  notes: string | null;
  details: Record<string, unknown> | null;
  difficulty: number | null;
  feeling: string | null;
  hasPhoto: boolean;
  photoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  update: (params: {
    value?: number;
    notes?: string;
    details?: Record<string, unknown>;
    difficulty?: number;
    feeling?: string;
    hasPhoto?: boolean;
    photoUrl?: string;
  }) => HabitLog;
}

export interface CreateHabitInput {
  userId: string;
  name: string;
  description?: string;
  category: HabitCategory;
  color: HabitColor;
  frequencyType: FrequencyType;
  frequencyValue: FrequencyValue;
  subCategory?: string;
  goal?: number;
  metricType?: string;
  units?: string;
  notes?: string;
  reminder?: Date;
  reminderEnabled?: boolean;
}

export interface UpdateHabitInput {
  name?: string;
  description?: string;
  category?: HabitCategory;
  color?: HabitColor;
  frequencyType?: FrequencyType;
  frequencyValue?: FrequencyValue;
  subCategory?: string;
  goal?: number;
  metricType?: string;
  units?: string;
  notes?: string;
  reminder?: Date;
  reminderEnabled?: boolean;
  isActive?: boolean;
  isArchived?: boolean;
}
