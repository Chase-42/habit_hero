import type { Habit, HabitLog } from "~/domain/models/habit";
import {
  type ApiResponse,
  type ApiError,
  isApiError,
  isApiResponse,
} from "~/interface-adapters/types/validation";
import type { ApiHabit, NewHabit } from "~/interface-adapters/types/api";
import {
  now,
  startOfDay,
  endOfDay,
  addDays,
  toISOString,
  fromISOString,
} from "~/domain/utils/date";

class ApiClientError extends Error {
  constructor(
    message: string,
    public originalError?: ApiError
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

function handleApiError(error: unknown): never {
  console.error("[API] Operation failed:", error);
  if (isApiError(error)) {
    throw new ApiClientError(error.message, error);
  }
  throw new ApiClientError("An unknown error occurred");
}

function validateApiResponse<T>(response: unknown): ApiResponse<T> {
  if (!isApiResponse<T>(response)) {
    throw new ApiClientError("Invalid API response format");
  }
  return response;
}

export async function fetchHabits(userId: string): Promise<ApiHabit[]> {
  console.log(
    "[API] Fetching habits for user:",
    JSON.stringify(userId, null, 2)
  );
  try {
    const response = await fetch(`/api/habits?userId=${userId}`);
    console.log("[API] Habits response status:", response.status);
    const result = validateApiResponse<ApiHabit[]>(await response.json());

    if (result.error) {
      console.error(
        "[API] Habits fetch error:",
        JSON.stringify(result.error, null, 2)
      );
      throw new ApiClientError(result.error.message, result.error);
    }

    if (!result.data) {
      throw new ApiClientError("No data returned from API");
    }

    return result.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createHabit(habit: NewHabit): Promise<ApiHabit> {
  console.log("[API] Creating habit:", JSON.stringify(habit, null, 2));
  try {
    const response = await fetch("/api/habits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(habit),
    });
    console.log("[API] Create habit response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[API] Create habit error response:",
        JSON.stringify(errorText, null, 2)
      );
      throw new ApiClientError(
        `API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const result = validateApiResponse<ApiHabit>(await response.json());

    if (result.error) {
      console.error(
        "[API] Create habit error:",
        JSON.stringify(result.error, null, 2)
      );
      throw new ApiClientError(result.error.message, result.error);
    }

    if (!result.data) {
      throw new ApiClientError("No data returned from API");
    }

    return result.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function completeHabit(habit: ApiHabit): Promise<void> {
  const logData = {
    habitId: habit.id,
    userId: habit.userId,
    completedAt: now().toISOString(),
    value: null,
    notes: null,
    details: null,
    difficulty: null,
    feeling: null,
    hasPhoto: false,
    photoUrl: null,
  };

  try {
    const response = await fetch("/api/habits/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logData),
    });

    const result = validateApiResponse<void>(await response.json());

    if (result.error) {
      throw new ApiClientError(result.error.message, result.error);
    }
  } catch (error) {
    handleApiError(error);
  }
}

export async function fetchHabitLogs(
  habitId: string,
  startDate: Date,
  endDate: Date
): Promise<HabitLog[]> {
  console.log(
    "[API] Fetching habit logs:",
    JSON.stringify({ habitId, startDate, endDate }, null, 2)
  );
  try {
    const response = await fetch(
      `/api/habits/logs?habitId=${habitId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    );
    console.log("[API] Habit logs response status:", response.status);
    const result = validateApiResponse<HabitLog[]>(await response.json());

    if (result.error) {
      console.error(
        "[API] Habit logs fetch error:",
        JSON.stringify(result.error, null, 2)
      );
      throw new ApiClientError(result.error.message, result.error);
    }

    if (!result.data) {
      throw new ApiClientError("No data returned from API");
    }

    // Convert ISO strings to Date objects
    return result.data.map((log: HabitLog) => ({
      ...log,
      completedAt: new Date(log.completedAt),
      createdAt: new Date(log.createdAt),
      updatedAt: new Date(log.updatedAt),
    }));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchTodaysLogs(habitId: string): Promise<HabitLog[]> {
  const today = startOfDay(now());
  const tomorrow = addDays(today, 1);

  return fetchHabitLogs(habitId, today, tomorrow);
}

export async function deleteHabitLog(
  habitId: string,
  date: Date
): Promise<void> {
  const start = startOfDay(date);
  const end = endOfDay(date);

  try {
    // First get the log for this date
    const logs = await fetchHabitLogs(habitId, start, end);
    if (logs.length === 0) return;

    const log = logs[0];
    if (!log) return;

    // Delete the log
    const response = await fetch(`/api/habits/logs/${log.id}`, {
      method: "DELETE",
    });

    const result = validateApiResponse<void>(await response.json());

    if (result.error) {
      throw new ApiClientError(result.error.message, result.error);
    }
  } catch (error) {
    handleApiError(error);
  }
}

export async function toggleHabit({
  id,
  userId,
}: {
  id: string;
  userId: string;
}): Promise<ApiHabit> {
  console.log("[API] Toggling habit:", JSON.stringify({ id, userId }, null, 2));
  try {
    const response = await fetch(`/api/habits/${id}/toggle`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
      }),
    });
    console.log("[API] Toggle habit response status:", response.status);
    const result = validateApiResponse<ApiHabit>(await response.json());

    if (result.error) {
      console.error(
        "[API] Toggle habit error:",
        JSON.stringify(result.error, null, 2)
      );
      throw new ApiClientError(result.error.message, result.error);
    }

    if (!result.data) {
      throw new ApiClientError("No data returned from API");
    }

    return result.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateHabit(habit: ApiHabit): Promise<ApiHabit> {
  console.log("[API] Updating habit:", JSON.stringify(habit, null, 2));
  try {
    const response = await fetch(`/api/habits/${habit.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(habit),
    });
    console.log("[API] Update habit response status:", response.status);
    const result = validateApiResponse<ApiHabit>(await response.json());

    if (result.error) {
      console.error(
        "[API] Update habit error:",
        JSON.stringify(result.error, null, 2)
      );
      throw new ApiClientError(result.error.message, result.error);
    }

    if (!result.data) {
      throw new ApiClientError("No data returned from API");
    }

    return result.data;
  } catch (error) {
    return handleApiError(error);
  }
}
