import type { Habit, HabitLog } from "~/types";
import type { ApiResponse } from "~/types/api/validation";
import { useAuth } from "@clerk/nextjs";

const getBaseUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return "https://api.habithero.app";
  }
  return "http://localhost:3000";
};

const getHeaders = async (userId: string) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (userId) {
    headers.Authorization = `Bearer ${userId}`;
  }

  return headers;
};

export async function fetchHabits(userId: string): Promise<Habit[]> {
  const response = await fetch(`${getBaseUrl()}/api/habits?userId=${userId}`, {
    headers: await getHeaders(userId),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch habits");
  }

  const result = (await response.json()) as ApiResponse<Habit[]>;
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export async function createHabit(data: Omit<Habit, "id">): Promise<Habit> {
  const response = await fetch(`${getBaseUrl()}/api/habits`, {
    method: "POST",
    headers: await getHeaders(data.userId),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create habit");
  }

  const result = (await response.json()) as ApiResponse<Habit>;
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export async function completeHabit(
  habitId: string,
  userId: string
): Promise<HabitLog> {
  const response = await fetch(
    `${getBaseUrl()}/api/habits/${habitId}/complete`,
    {
      method: "POST",
      headers: await getHeaders(userId),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to complete habit");
  }

  const result = (await response.json()) as ApiResponse<HabitLog>;
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export async function fetchHabitLogs(
  habitId: string,
  startDate: Date,
  endDate: Date,
  userId: string
): Promise<HabitLog[]> {
  const url = new URL(`${getBaseUrl()}/api/habits/logs`);
  url.searchParams.append("habitId", habitId);
  url.searchParams.append("startDate", startDate.toISOString());
  url.searchParams.append("endDate", endDate.toISOString());

  const response = await fetch(url.toString(), {
    headers: await getHeaders(userId),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch habit logs");
  }

  const result = (await response.json()) as ApiResponse<HabitLog[]>;
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export async function fetchTodaysLogs(userId: string): Promise<HabitLog[]> {
  const response = await fetch(`${getBaseUrl()}/api/habits/logs/today`, {
    headers: await getHeaders(userId),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch today's logs");
  }

  const result = (await response.json()) as ApiResponse<HabitLog[]>;
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export async function deleteHabitLog(
  logId: string,
  userId: string
): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/api/habits/logs/${logId}`, {
    method: "DELETE",
    headers: await getHeaders(userId),
  });

  if (!response.ok) {
    throw new Error("Failed to delete habit log");
  }

  const result = (await response.json()) as ApiResponse<void>;
  if (result.error) {
    throw new Error(result.error.message);
  }
}

export async function toggleHabit(
  habit: Habit,
  isCompleted: boolean
): Promise<Habit> {
  const response = await fetch(
    `${getBaseUrl()}/api/habits/${habit.id}/toggle`,
    {
      method: "PUT",
      headers: await getHeaders(habit.userId),
      body: JSON.stringify({
        completed: !isCompleted,
        userId: habit.userId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to toggle habit");
  }

  const result = (await response.json()) as ApiResponse<Habit>;
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data;
}
