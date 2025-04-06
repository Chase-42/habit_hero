import { type Habit } from "~/domain/entities/habit";
import { type HabitLog } from "~/domain/entities/habit-log";
import type { HabitCategory, HabitColor, FrequencyType } from "~/domain/enums";
import type { FrequencyValue } from "~/domain/utils/frequency";

/**
 * Interface for habit use cases
 */
export interface IHabitUseCase {
  /**
   * Create a new habit
   */
  createHabit(params: {
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
  }): Promise<Habit>;

  /**
   * Update an existing habit
   */
  updateHabit(params: {
    id: string;
    userId: string;
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
  }): Promise<Habit>;

  /**
   * Delete a habit
   */
  deleteHabit(id: string, userId: string): Promise<void>;

  /**
   * Get a habit by ID
   */
  getHabit(id: string, userId: string): Promise<Habit>;

  /**
   * Get all habits for a user
   */
  getHabits(userId: string): Promise<Habit[]>;

  /**
   * Complete a habit
   */
  completeHabit(params: {
    habitId: string;
    userId: string;
    value?: number;
    notes?: string;
    details?: Record<string, unknown>;
    difficulty?: number;
    feeling?: string;
    hasPhoto?: boolean;
    photoUrl?: string;
  }): Promise<HabitLog>;

  /**
   * Get habit logs
   */
  getHabitLogs(params: {
    habitId: string;
    userId: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<HabitLog[]>;
}
