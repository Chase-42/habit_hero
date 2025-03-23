import { useState } from "react";
import type {
  Habit,
  HabitFilters,
  HabitLog,
  CompletionSummary,
  StreakSummary,
} from "~/types";

interface ErrorResponse {
  error: string;
  details?: unknown;
}

export function useHabits(userId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/habits?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch habits");
      return (await response.json()) as Habit[];
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch habits");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilteredHabits = async (filters: HabitFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/habits/filtered", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });
      if (!response.ok) throw new Error("Failed to fetch filtered habits");
      return (await response.json()) as Habit[];
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch filtered habits"
      );
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const logHabit = async (log: Omit<HabitLog, "id">) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("logHabit called with:", log);
      console.log("Making request to /api/habits/logs");
      const response = await fetch("/api/habits/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(log),
      });
      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      const text = await response.text();
      console.log("Raw response:", text);

      let data;
      try {
        data = JSON.parse(text) as HabitLog | ErrorResponse;
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error("Invalid JSON response from server");
      }

      console.log("Parsed response data:", data);

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        console.error("Error response:", errorData);
        throw new Error(
          typeof errorData.error === "string"
            ? errorData.error
            : "Unknown error"
        );
      }

      console.log("Success response:", data);
      return data as HabitLog;
    } catch (err) {
      console.error("Error in logHabit:", err);
      setError(err instanceof Error ? err.message : "Failed to log habit");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHabitLogs = async (
    habitId: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      let url = `/api/habits/logs?habitId=${habitId}`;
      if (startDate) url += `&startDate=${startDate.toISOString()}`;
      if (endDate) url += `&endDate=${endDate.toISOString()}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch habit logs");
      return (await response.json()) as HabitLog[];
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch habit logs"
      );
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  async function fetchAnalytics(
    habitId: string,
    type: "completion",
    options?: {
      groupBy?: "day" | "week" | "month";
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<CompletionSummary[]>;
  async function fetchAnalytics(
    habitId: string,
    type: "streak",
    options?: {
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<StreakSummary[]>;
  async function fetchAnalytics(
    habitId: string,
    type: "completion" | "streak",
    options?: {
      groupBy?: "day" | "week" | "month";
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<CompletionSummary[] | StreakSummary[]> {
    setIsLoading(true);
    setError(null);
    try {
      let url = `/api/habits/analytics?type=${type}&habitId=${habitId}`;
      if (options?.groupBy) url += `&groupBy=${options.groupBy}`;
      if (options?.startDate)
        url += `&startDate=${options.startDate.toISOString()}`;
      if (options?.endDate) url += `&endDate=${options.endDate.toISOString()}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${type} analytics`);

      if (type === "completion") {
        return (await response.json()) as CompletionSummary[];
      } else {
        return (await response.json()) as StreakSummary[];
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to fetch ${type} analytics`
      );
      return type === "completion"
        ? ([] as CompletionSummary[])
        : ([] as StreakSummary[]);
    } finally {
      setIsLoading(false);
    }
  }

  const updateHabit = async (
    habitId: string,
    updates: Partial<Omit<Habit, "id" | "createdAt">>
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update habit");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update habit");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHabit = async (habitId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete habit");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete habit");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    fetchHabits,
    fetchFilteredHabits,
    logHabit,
    fetchHabitLogs,
    fetchAnalytics,
    updateHabit,
    deleteHabit,
  };
}
