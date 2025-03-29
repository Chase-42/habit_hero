import type { Habit, HabitDB, CreateHabit } from "~/entities/models/habit";
import type { HabitLog, HabitLogDB } from "~/entities/models/habit-log";
import { transformFromDBHabit } from "~/entities/models/habit";
import { transformFromDBHabitLog } from "~/entities/models/habit-log";
import type { NewHabitForm } from "~/entities/types/form";

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
  const dbHabits = (await response.json()) as HabitDB[];
  return dbHabits.map(transformFromDBHabit);
}

export async function createHabit(formData: NewHabitForm): Promise<Habit> {
  // Transform form data to match API schema
  const habitData: CreateHabit = {
    userId: formData.userId,
    title: formData.name,
    description: formData.description ?? "",
    category: formData.category,
    color: formData.color,
    icon: "default",
    frequencyType: formData.frequencyType,
    frequencyValue: formData.frequencyValue,
    isCompleted: false,
    isActive: true,
    isArchived: false,
    notes: formData.notes ?? "",
    lastCompleted: null,
    reminder: null,
    reminderEnabled: false,
  };

  console.log("Sending habit data:", habitData);

  const response = await fetch("/api/habits", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(habitData),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as ErrorResponse;
    throw new Error(errorData.error?.message || "Failed to create habit");
  }

  const dbHabit = (await response.json()) as HabitDB;
  console.log("Received habit from server:", dbHabit);

  return transformFromDBHabit(dbHabit);
}

export async function completeHabit(habit: Habit): Promise<void> {
  const logData = {
    habitId: habit.id,
    userId: habit.userId,
    completedAt: new Date(),
    value: undefined,
    notes: undefined,
    details: undefined,
    difficulty: undefined,
    feeling: undefined,
    hasPhoto: false,
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
  endDate: Date,
  userId: string
): Promise<HabitLog[]> {
  const response = await fetch(
    `/api/habits/logs?habitId=${habitId}&userId=${userId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
  );

  const data = (await response.json()) as ErrorResponse | HabitLogDB[];

  if (!response.ok) {
    throw new Error(
      (data as ErrorResponse).error?.message || "Failed to fetch habit logs"
    );
  }

  const dbLogs = data as HabitLogDB[];
  return dbLogs.map(transformFromDBHabitLog);
}

export async function fetchTodaysLogs(
  habitId: string,
  userId: string
): Promise<HabitLog[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return fetchHabitLogs(habitId, today, tomorrow, userId);
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
  const logs = await fetchHabitLogs(habitId, startOfDay, endOfDay, "");
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
      completed: isCompleted,
      userId: habit.userId,
    }),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as ErrorResponse;
    throw new Error(errorData.error?.message || "Failed to toggle habit");
  }
}

export async function deleteHabit(
  habitId: string,
  userId: string
): Promise<void> {
  const response = await fetch(`/api/habits/${habitId}/delete`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = (await response.json()) as ErrorResponse;
    throw new Error(errorData.error?.message || "Failed to delete habit");
  }
}
