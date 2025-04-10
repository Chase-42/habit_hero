import { type Habit } from "~/types";
import { FrequencyType } from "~/types/common/enums";
import { startOfDay } from "date-fns";

/**
 * Checks if a habit should be shown for today based on its frequency settings
 */
export function shouldShowHabitToday(habit: Habit): boolean {
  if (!habit.isActive || habit.isArchived) return false;

  const today = new Date();
  const todayDay = today.getDay();

  switch (habit.frequencyType) {
    case FrequencyType.Daily:
      return true;
    case FrequencyType.Weekly:
      return habit.frequencyValue?.days?.includes(todayDay) ?? false;
    case FrequencyType.Monthly:
      return today.getDate() === 1;
    default:
      return false;
  }
}

/**
 * Gets all habits that should be shown for today
 */
export function getTodayHabits(habits: Habit[]): Habit[] {
  return habits.filter(shouldShowHabitToday);
}

/**
 * Checks if a habit was completed on a specific date
 */
export function isHabitCompletedOnDate(
  habit: Habit,
  date: Date,
  habitLogs: Array<{ habitId: string; completedAt: Date }>
): boolean {
  const startOfTargetDate = startOfDay(date);
  return habitLogs.some(
    (log) =>
      log.habitId === habit.id &&
      startOfDay(log.completedAt).getTime() === startOfTargetDate.getTime()
  );
}

/**
 * Calculates the completion rate for a habit over a date range
 */
export function calculateCompletionRate(
  habit: Habit,
  startDate: Date,
  endDate: Date,
  habitLogs: Array<{ habitId: string; completedAt: Date }>
): number {
  const relevantLogs = habitLogs.filter(
    (log) =>
      log.habitId === habit.id &&
      log.completedAt >= startDate &&
      log.completedAt <= endDate
  );

  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return totalDays > 0 ? (relevantLogs.length / totalDays) * 100 : 0;
}
