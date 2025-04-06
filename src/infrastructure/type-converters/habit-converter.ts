import { Habit } from "~/domain/entities/habit";
import { HabitLog } from "~/domain/entities/habit-log";
import { type habits, type habitLogs } from "~/server/db/schema";
import type { InferModel } from "drizzle-orm";

type HabitRow = InferModel<typeof habits>;
type HabitLogRow = InferModel<typeof habitLogs>;

export function toDomainHabit(dbHabit: HabitRow): Habit {
  return Habit.fromDb({
    id: dbHabit.id,
    userId: dbHabit.userId,
    name: dbHabit.name,
    description: dbHabit.description,
    category: dbHabit.category,
    color: dbHabit.color,
    frequencyType: dbHabit.frequencyType,
    frequencyValue: dbHabit.frequencyValue,
    streak: dbHabit.streak,
    longestStreak: dbHabit.longestStreak,
    isActive: dbHabit.isActive,
    isArchived: dbHabit.isArchived,
    createdAt: dbHabit.createdAt,
    updatedAt: dbHabit.updatedAt,
    subCategory: dbHabit.subCategory,
    lastCompleted: dbHabit.lastCompleted,
    goal: dbHabit.goal,
    metricType: dbHabit.metricType,
    units: dbHabit.units,
    notes: dbHabit.notes,
    reminder: dbHabit.reminder,
    reminderEnabled: dbHabit.reminderEnabled,
  });
}

export function toDbHabit(habit: Habit): HabitRow {
  return {
    id: habit.id,
    userId: habit.userId,
    name: habit.name,
    description: habit.description,
    category: habit.category,
    color: habit.color,
    frequencyType: habit.frequencyType,
    frequencyValue: habit.frequencyValue,
    streak: habit.streak,
    longestStreak: habit.longestStreak,
    isActive: habit.isActive,
    isArchived: habit.isArchived,
    createdAt: habit.createdAt,
    updatedAt: habit.updatedAt,
    subCategory: habit.subCategory,
    lastCompleted: habit.lastCompleted,
    goal: habit.goal,
    metricType: habit.metricType,
    units: habit.units,
    notes: habit.notes,
    reminder: habit.reminder,
    reminderEnabled: habit.reminderEnabled,
  };
}

export function toDomainHabitLog(dbLog: HabitLogRow): HabitLog {
  return HabitLog.fromDb({
    id: dbLog.id,
    habitId: dbLog.habitId,
    userId: dbLog.userId,
    completedAt: dbLog.completedAt,
    value: dbLog.value,
    notes: dbLog.notes,
    details: dbLog.details,
    difficulty: dbLog.difficulty,
    feeling: dbLog.feeling,
    hasPhoto: dbLog.hasPhoto,
    photoUrl: dbLog.photoUrl,
    createdAt: dbLog.createdAt,
    updatedAt: dbLog.updatedAt,
  });
}

export function toDbHabitLog(log: HabitLog): HabitLogRow {
  return {
    id: log.id,
    habitId: log.habitId,
    userId: log.userId,
    completedAt: log.completedAt,
    value: log.value,
    notes: log.notes,
    details: log.details,
    difficulty: log.difficulty,
    feeling: log.feeling,
    hasPhoto: log.hasPhoto,
    photoUrl: log.photoUrl,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  };
}
