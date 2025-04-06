import { fetchHabitLogs } from "~/infrastructure/external/api/api-client";
import type { Habit, HabitLog } from "./habit";

export async function fetchHabitLogsForDateRange(
  habitId: string,
  startDate: Date,
  endDate: Date
): Promise<HabitLog[]> {
  return fetchHabitLogs(habitId, startDate, endDate);
}

export async function fetchTodayHabitLogs(
  habits: Habit[]
): Promise<HabitLog[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayLogs = await Promise.all(
    habits.map(async (habit) => {
      const logs = await fetchHabitLogs(habit.id, today, tomorrow);
      return logs;
    })
  );

  return todayLogs.flat();
}

export async function fetchRecentHabitLogs(
  habits: Habit[]
): Promise<HabitLog[]> {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 14);

  const recentLogs = await Promise.all(
    habits.map(async (habit) => {
      const logs = await fetchHabitLogs(habit.id, startDate, endDate);
      return logs;
    })
  );

  return recentLogs.flat();
}

export async function fetchUserHabitLogs(
  userId: string,
  habits: Habit[]
): Promise<HabitLog[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayLogs = await Promise.all(
    habits.map(async (habit) => {
      const logs = await fetchHabitLogs(habit.id, today, tomorrow);
      return logs;
    })
  );

  return todayLogs.flat();
}
