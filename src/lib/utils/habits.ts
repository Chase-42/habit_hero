import type { Habit, HabitLog } from "~/types";
import { FrequencyType } from "~/types/common/enums";
import { startOfDay } from "date-fns";
import { isSameDay, getToday } from "./dates";
import { logger } from "~/lib/logger";

const habitLogger = logger.withNamespace("habits");

/**
 * Checks if a habit should be shown for today based on its frequency settings
 */
export const shouldShowHabitToday = (habit: Habit): boolean => {
  const today = getToday();
  const createdAt = new Date(habit.createdAt);

  habitLogger.debug("Checking if habit should be shown today", {
    context: "should_show_habit",
    data: {
      habitId: habit.id,
      name: habit.name,
      isActive: habit.isActive,
      isArchived: habit.isArchived,
      createdAt: createdAt.toISOString(),
      today: today.toISOString(),
      frequencyType: habit.frequencyType,
      frequencyValue: habit.frequencyValue,
    },
  });

  if (!habit.isActive) {
    habitLogger.debug("Habit is not active", {
      context: "habit_status",
      data: { habitId: habit.id },
    });
    return false;
  }

  if (habit.isArchived) {
    habitLogger.debug("Habit is archived", {
      context: "habit_status",
      data: { habitId: habit.id },
    });
    return false;
  }

  // Allow habits created today
  if (createdAt > today && !isSameDay(createdAt, today)) {
    habitLogger.debug("Habit was created after today", {
      context: "habit_creation",
      data: {
        habitId: habit.id,
        createdAt: createdAt.toISOString(),
        today: today.toISOString(),
      },
    });
    return false;
  }

  switch (habit.frequencyType) {
    case FrequencyType.Daily:
      habitLogger.debug("Daily habit should be shown", {
        context: "frequency_check",
        data: { habitId: habit.id },
      });
      return true;
    case FrequencyType.Weekly:
      const shouldShow =
        habit.frequencyValue.days?.includes(today.getDay()) ?? false;
      habitLogger.debug("Weekly habit check", {
        context: "frequency_check",
        data: {
          habitId: habit.id,
          todayDay: today.getDay(),
          frequencyDays: habit.frequencyValue.days,
          shouldShow,
        },
      });
      return shouldShow;
    case FrequencyType.Monthly:
      const shouldShowMonthly =
        habit.frequencyValue.days?.includes(today.getDate()) ?? false;
      habitLogger.debug("Monthly habit check", {
        context: "frequency_check",
        data: {
          habitId: habit.id,
          todayDate: today.getDate(),
          frequencyDays: habit.frequencyValue.days,
          shouldShow: shouldShowMonthly,
        },
      });
      return shouldShowMonthly;
    default:
      habitLogger.debug("Unknown frequency type", {
        context: "frequency_check",
        data: {
          habitId: habit.id,
          frequencyType: habit.frequencyType,
        },
      });
      return false;
  }
};

/**
 * Gets all habits that should be shown for today
 */
export const getTodayHabits = (habits: Habit[]): Habit[] => {
  const today = startOfDay(new Date());
  habitLogger.debug("Getting today's habits", {
    context: "get_today_habits",
    data: {
      totalHabits: habits.length,
      today: today.toISOString(),
    },
  });

  const todayHabits = habits.filter((habit) => {
    // Only check if the habit should be shown today based on frequency and active status
    const shouldShow = shouldShowHabitToday(habit);

    if (!shouldShow) {
      habitLogger.debug("Habit filtered out", {
        context: "get_today_habits",
        data: {
          habitId: habit.id,
          name: habit.name,
          createdAt: new Date(habit.createdAt).toISOString(),
          isActive: habit.isActive,
          isArchived: habit.isArchived,
          frequencyType: habit.frequencyType,
        },
      });
    }

    return shouldShow;
  });

  habitLogger.debug("Today's habits result", {
    context: "get_today_habits",
    data: {
      totalHabits: habits.length,
      todayHabitsCount: todayHabits.length,
      todayHabits: todayHabits.map((h) => ({
        id: h.id,
        name: h.name,
        frequencyType: h.frequencyType,
      })),
    },
  });

  return todayHabits;
};

/**
 * Checks if a habit was completed on a specific date
 */
export const isHabitCompletedOnDate = (
  habit: Habit,
  logs: HabitLog[],
  date: Date
): boolean => {
  return logs.some(
    (log) =>
      log.habitId === habit.id && isSameDay(new Date(log.completedAt), date)
  );
};

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

export const calculateStreak = (
  habit: Habit,
  logs: HabitLog[],
  currentDate: Date = new Date()
): number => {
  if (!habit.lastCompleted) return 0;

  const lastCompleted = new Date(habit.lastCompleted);
  const today = startOfDay(currentDate);

  // If habit was completed today, start counting from yesterday
  const startDate = isSameDay(lastCompleted, today)
    ? new Date(today.setDate(today.getDate() - 1))
    : lastCompleted;

  let streak = 0;
  let currentStreakDate = startDate;

  while (currentStreakDate <= today) {
    const isCompleted = logs.some(
      (log) =>
        log.habitId === habit.id &&
        isSameDay(new Date(log.completedAt), currentStreakDate)
    );

    if (!isCompleted) break;

    streak++;
    currentStreakDate = new Date(
      currentStreakDate.setDate(currentStreakDate.getDate() + 1)
    );
  }

  habitLogger.debug("Calculated streak", {
    context: "streak_calculation",
    data: { habitId: habit.id, streak },
  });
  return streak;
};
