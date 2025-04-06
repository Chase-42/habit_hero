import { Habit } from "~/domain/entities/habit";
import { HabitLog } from "~/domain/entities/habit-log";
import type { ApiHabit, ApiHabitLog } from "~/interface-adapters/types/api";
import {
  type HabitCategory,
  type HabitColor,
  type FrequencyType,
} from "~/domain/enums";
import { fromISOString } from "./date";

/**
 * Convert API habit to domain habit
 */
export function convertApiHabitToHabit(apiHabit: ApiHabit): Habit {
  return Habit.create({
    userId: apiHabit.userId,
    name: apiHabit.name,
    description: apiHabit.description ?? undefined,
    category: apiHabit.category as HabitCategory,
    color: apiHabit.color as HabitColor,
    frequencyType: apiHabit.frequencyType as FrequencyType,
    frequencyValue: apiHabit.frequencyValue,
    subCategory: apiHabit.subCategory ?? undefined,
    goal: apiHabit.goal ?? undefined,
    metricType: apiHabit.metricType ?? undefined,
    units: apiHabit.units ?? undefined,
    notes: apiHabit.notes ?? undefined,
    reminder: apiHabit.reminder
      ? (fromISOString(apiHabit.reminder) ?? new Date())
      : undefined,
    reminderEnabled: apiHabit.reminderEnabled,
  });
}

/**
 * Convert domain habit to API habit
 */
export function convertHabitToApiHabit(habit: Habit): ApiHabit {
  return {
    id: habit.id,
    userId: habit.userId,
    name: habit.name,
    description: habit.description,
    category: habit.category,
    color: habit.color,
    frequencyType: habit.frequencyType,
    frequencyValue: habit.frequencyValue,
    isActive: habit.isActive,
    isArchived: habit.isArchived,
    streak: habit.streak,
    longestStreak: habit.longestStreak,
    lastCompleted: habit.lastCompleted?.toISOString() ?? null,
    reminder: habit.reminder?.toISOString() ?? null,
    reminderEnabled: habit.reminderEnabled,
    subCategory: habit.subCategory,
    goal: habit.goal,
    metricType: habit.metricType,
    units: habit.units,
    notes: habit.notes,
    createdAt: habit.createdAt.toISOString(),
    updatedAt: habit.updatedAt.toISOString(),
  };
}

/**
 * Convert API habit log to domain habit log
 */
export function convertApiHabitLogToHabitLog(apiLog: ApiHabitLog): HabitLog {
  return HabitLog.create({
    habitId: apiLog.habitId,
    userId: apiLog.userId,
    value: apiLog.value ?? undefined,
    notes: apiLog.notes ?? undefined,
    details: apiLog.details ?? undefined,
    difficulty: apiLog.difficulty ?? undefined,
    feeling: apiLog.feeling ?? undefined,
    hasPhoto: apiLog.hasPhoto,
    photoUrl: apiLog.photoUrl ?? undefined,
  });
}

/**
 * Convert domain habit log to API habit log
 */
export function convertHabitLogToApiHabitLog(log: HabitLog): ApiHabitLog {
  return {
    id: log.id,
    habitId: log.habitId,
    userId: log.userId,
    completedAt: log.completedAt.toISOString(),
    value: log.value,
    notes: log.notes,
    details: log.details,
    difficulty: log.difficulty,
    feeling: log.feeling,
    hasPhoto: log.hasPhoto,
    photoUrl: log.photoUrl,
    createdAt: log.createdAt.toISOString(),
    updatedAt: log.updatedAt.toISOString(),
  };
}
