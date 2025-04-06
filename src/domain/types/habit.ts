import {
  type HabitCategory,
  type HabitColor,
  type FrequencyType,
} from "../enums";

export interface HabitType {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  category: HabitCategory;
  color: HabitColor;
  frequencyType: FrequencyType;
  frequencyValue: number;
  startDate: Date;
  endDate: Date | null;
  reminderTime: string | null;
  reminderEnabled: boolean;
  isActive: boolean;
  isArchived: boolean;
  streak: number;
  longestStreak: number;
  lastCompleted: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHabitInput {
  userId: string;
  name: string;
  description?: string | null;
  category: HabitCategory;
  color: HabitColor;
  frequencyType: FrequencyType;
  frequencyValue: number;
  startDate: Date;
  endDate?: Date | null;
  reminderTime?: string | null;
  reminderEnabled?: boolean;
}

export interface UpdateHabitInput {
  name?: string;
  description?: string | null;
  category?: HabitCategory;
  color?: HabitColor;
  frequencyType?: FrequencyType;
  frequencyValue?: number;
  endDate?: Date | null;
  reminderTime?: string | null;
  reminderEnabled?: boolean;
  isActive?: boolean;
  isArchived?: boolean;
}
