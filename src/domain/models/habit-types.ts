import {
  type HabitCategory,
  type FrequencyType,
  type HabitColor,
} from "../enums";
import type { FrequencyValue } from "../utils/frequency";
import type { HabitLog as HabitLogEntity } from "../entities/habit-log";
import type { Habit as HabitEntity } from "../entities/habit";

/**
 * Base properties required for any habit
 */
export interface HabitBase {
  name: string;
  category: HabitCategory;
  frequencyType: FrequencyType;
  frequencyValue: FrequencyValue;
  color: HabitColor;
  description: string | null;
  subCategory: string | null;
  goal: number | null;
  metricType: string | null;
  units: string | null;
  notes: string | null;
  reminder: Date | null;
  reminderEnabled: boolean;
}

/**
 * Input type for creating a new habit
 */
export interface CreateHabitInput extends Omit<HabitBase, "color"> {
  userId: string;
  color?: HabitColor;
}

/**
 * Input type for updating an existing habit
 */
export interface UpdateHabitInput extends Partial<HabitBase> {
  id: string;
  userId: string;
}

/**
 * Complete habit entity with all properties
 */
export type Habit = HabitEntity;

/**
 * Base properties for a habit log
 */
export interface HabitLogBase {
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
}

/**
 * Complete habit log entity with all properties
 */
export type HabitLog = HabitLogEntity;
