import type { Habit, HabitLog } from "~/types";
import type { ApiResponse } from "~/types/api/validation";

type NewHabit = Omit<
  Habit,
  "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
>;

export async function fetchHabits(userId: string): Promise<Habit[]> {
  const response = await fetch(`/api/habits?userId=${userId}`);
  const result = (await response.json()) as ApiResponse<Habit[]>;

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function createHabit(habit: NewHabit): Promise<Habit> {
  const response = await fetch("/api/habits", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(habit),
  });

  const result = (await response.json()) as ApiResponse<Habit>;

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function completeHabit(habit: Habit): Promise<void> {
  const logData = {
    habitId: habit.id,
    userId: habit.userId,
    completedAt: new Date(),
    value: null,
    notes: null,
    details: null,
    difficulty: null,
    feeling: null,
    hasPhoto: false,
    photoUrl: null,
  };

  const response = await fetch("/api/habits/logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(logData),
  });

  const result = (await response.json()) as ApiResponse<void>;

  if (result.error) {
    throw new Error(result.error.message);
  }
}

export async function fetchHabitLogs(
  habitId: string,
  startDate: Date,
  endDate: Date
): Promise<HabitLog[]> {
  const response = await fetch(
    `/api/habits/logs?habitId=${habitId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
  );

  const result = (await response.json()) as ApiResponse<HabitLog[]>;

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function fetchTodaysLogs(habitId: string): Promise<HabitLog[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return fetchHabitLogs(habitId, today, tomorrow);
}

export async function deleteHabitLog(
  habitId: string,
  date: Date
): Promise<void> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // First get the log for this date
  const logs = await fetchHabitLogs(habitId, startOfDay, endOfDay);
  if (logs.length === 0) return;

  const log = logs[0];
  if (!log) return;

  // Delete the log
  const response = await fetch(`/api/habits/logs/${log.id}`, {
    method: "DELETE",
  });

  const result = (await response.json()) as ApiResponse<void>;

  if (result.error) {
    throw new Error(result.error.message);
  }
}

export async function toggleHabit(habit: Habit): Promise<Habit> {
  const response = await fetch(`/api/habits/${habit.id}/toggle`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: habit.userId,
    }),
  });

  const result = (await response.json()) as ApiResponse<Habit>;

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}
