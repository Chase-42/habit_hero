import type { Habit, HabitLog } from "~/domain/models/habit";
import type { ApiHabit, ApiHabitLog } from "~/interface-adapters/types/api";

function fromISOString(date: string | null): Date | null {
  return date ? new Date(date) : null;
}

export function fromApiHabit(apiHabit: ApiHabit): Habit {
  const habit: Habit = {
    id: apiHabit.id,
    userId: apiHabit.userId,
    name: apiHabit.name,
    description: apiHabit.description,
    category: apiHabit.category as Habit["category"],
    color: apiHabit.color as Habit["color"],
    frequencyType: apiHabit.frequencyType as Habit["frequencyType"],
    frequencyValue: {
      days: apiHabit.frequencyValue.days,
      times: apiHabit.frequencyValue.times,
    },
    streak: apiHabit.streak,
    longestStreak: apiHabit.longestStreak,
    isActive: apiHabit.isActive,
    isArchived: apiHabit.isArchived,
    createdAt: new Date(apiHabit.createdAt),
    updatedAt: new Date(apiHabit.updatedAt),
    subCategory: apiHabit.subCategory,
    lastCompleted: fromISOString(apiHabit.lastCompleted),
    goal: apiHabit.goal,
    metricType: apiHabit.metricType,
    units: apiHabit.units,
    notes: apiHabit.notes,
    reminder: fromISOString(apiHabit.reminder),
    reminderEnabled: apiHabit.reminderEnabled,
    complete: function (completedAt?: Date) {
      return {
        ...this,
        lastCompleted: completedAt ?? new Date(),
        updatedAt: new Date(),
      };
    },
    update: function (params) {
      return {
        ...this,
        ...params,
        updatedAt: new Date(),
      };
    },
  };
  return habit;
}

export function toApiHabit(habit: Habit): ApiHabit {
  return {
    id: habit.id,
    userId: habit.userId,
    name: habit.name,
    description: habit.description,
    category: habit.category,
    color: habit.color,
    frequencyType: habit.frequencyType,
    frequencyValue: {
      days: habit.frequencyValue.days,
      times: habit.frequencyValue.times,
    },
    streak: habit.streak,
    longestStreak: habit.longestStreak,
    isActive: habit.isActive,
    isArchived: habit.isArchived,
    createdAt: habit.createdAt.toISOString(),
    updatedAt: habit.updatedAt.toISOString(),
    subCategory: habit.subCategory,
    lastCompleted: habit.lastCompleted?.toISOString() ?? null,
    goal: habit.goal,
    metricType: habit.metricType,
    units: habit.units,
    notes: habit.notes,
    reminder: habit.reminder?.toISOString() ?? null,
    reminderEnabled: habit.reminderEnabled,
  };
}

export function fromApiHabitLog(apiLog: ApiHabitLog): HabitLog {
  const log: HabitLog = {
    id: apiLog.id,
    habitId: apiLog.habitId,
    userId: apiLog.userId,
    completedAt: new Date(apiLog.completedAt),
    value: apiLog.value,
    notes: apiLog.notes,
    details: apiLog.details,
    difficulty: apiLog.difficulty,
    feeling: apiLog.feeling,
    hasPhoto: apiLog.hasPhoto,
    photoUrl: apiLog.photoUrl,
    createdAt: new Date(apiLog.createdAt),
    updatedAt: new Date(apiLog.updatedAt),
    update: function (params) {
      return {
        ...this,
        ...params,
        updatedAt: new Date(),
      };
    },
  };
  return log;
}

export function toApiHabitLog(log: HabitLog): ApiHabitLog {
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
