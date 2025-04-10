import type { Habit, HabitLog } from "~/types";
import type { ApiResponse } from "~/types/api/validation";
import { auth } from "@clerk/nextjs/server";

const getBaseUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return ""; // Use relative paths in production
  }
  return "http://localhost:3000";
};

const getHeaders = async () => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const { userId } = await auth();
  if (userId) {
    headers.Authorization = `Bearer ${userId}`;
  }

  return headers;
};

export async function fetchHabitsServer(): Promise<Habit[]> {
  const response = await fetch(`${getBaseUrl()}/api/habits`, {
    headers: await getHeaders(),
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

export async function createHabitServer(
  data: Omit<Habit, "id">
): Promise<Habit> {
  const response = await fetch(`${getBaseUrl()}/api/habits`, {
    method: "POST",
    headers: await getHeaders(),
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

export async function fetchHabitLogsServer(
  habitId: string,
  startDate: Date,
  endDate: Date
): Promise<HabitLog[]> {
  const url = new URL(`${getBaseUrl()}/api/habits/logs`);
  url.searchParams.append("habitId", habitId);
  url.searchParams.append("startDate", startDate.toISOString());
  url.searchParams.append("endDate", endDate.toISOString());

  const response = await fetch(url.toString(), {
    headers: await getHeaders(),
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
