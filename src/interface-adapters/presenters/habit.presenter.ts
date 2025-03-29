import type { Habit, FrequencyValue } from "~/entities/models/habit";

export interface HabitResponse {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  category: string | null;
  color: string;
  icon: string | null;
  frequencyType: string;
  frequencyValue: FrequencyValue;
  streak: number;
  longestStreak: number;
  isCompleted: boolean;
  isActive: boolean;
  isArchived: boolean;
  lastCompleted: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  reminder: string | null;
  reminderEnabled: boolean;
}

export class HabitPresenter {
  static toResponse(habit: Habit): HabitResponse {
    return {
      id: habit.id.toString(),
      userId: habit.userId,
      name: habit.name,
      description: habit.description,
      category: habit.category,
      color: habit.color,
      icon: habit.icon,
      frequencyType: habit.frequencyType,
      frequencyValue: habit.frequencyValue,
      streak: habit.streak,
      longestStreak: habit.longestStreak,
      isCompleted: habit.isCompleted,
      isActive: habit.isActive,
      isArchived: habit.isArchived,
      lastCompleted: habit.lastCompleted?.toISOString() ?? null,
      notes: habit.notes,
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
      reminder: habit.reminder?.toISOString() ?? null,
      reminderEnabled: habit.reminderEnabled,
    };
  }

  static toResponses(habits: Habit[]): HabitResponse[] {
    return habits.map((habit) => this.toResponse(habit));
  }
}
