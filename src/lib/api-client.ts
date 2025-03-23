import type { Habit, HabitLog } from "~/types";

type NewHabit = Omit<
  Habit,
  "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
>;

interface ErrorResponse {
  error: {
    message: string;
  };
}

export async function fetchHabits(userId: string): Promise<Habit[]> {
  const response = await fetch(`/api/habits?userId=${userId}`);
  if (!response.ok) {
    const errorData = (await response.json()) as ErrorResponse;
    throw new Error(errorData.error?.message || "Failed to load habits");
  }
  return response.json() as Promise<Habit[]>;
}

export async function createHabit(habit: NewHabit): Promise<Habit> {
  const response = await fetch("/api/habits", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(habit),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as ErrorResponse;
    throw new Error(errorData.error?.message || "Failed to create habit");
  }

  return response.json() as Promise<Habit>;
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

  if (!response.ok) {
    const errorData = (await response.json()) as ErrorResponse;
    throw new Error(errorData.error?.message || "Failed to complete habit");
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

  if (!response.ok) {
    const errorData = (await response.json()) as ErrorResponse;
    throw new Error(errorData.error?.message || "Failed to fetch habit logs");
  }

  return response.json() as Promise<HabitLog[]>;
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

  if (!response.ok) {
    const errorData = (await response.json()) as ErrorResponse;
    throw new Error(errorData.error?.message || "Failed to uncomplete habit");
  }
}

export async function toggleHabit(
  habit: Habit,
  isCompleted: boolean
): Promise<void> {
  const response = await fetch(`/api/habits/${habit.id}/toggle`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      completed: !isCompleted,
      userId: habit.userId,
    }),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as ErrorResponse;
    throw new Error(errorData.error?.message || "Failed to toggle habit");
  }
}
