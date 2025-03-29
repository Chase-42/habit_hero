import { useState } from "react";
import type {
  Habit,
  HabitFilters,
  HabitLog,
  CompletionSummary,
  StreakSummary,
} from "~/types";
import type { ApiResponse } from "~/types/api/validation";

export function useHabits(userId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/habits?userId=${userId}`);
      const result = (await response.json()) as ApiResponse<Habit[]>;

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
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
      const result = (await response.json()) as ApiResponse<Habit[]>;

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
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
      const response = await fetch("/api/habits/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(log),
      });

      const result = (await response.json()) as ApiResponse<HabitLog>;

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
    } catch (err) {
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
      const result = (await response.json()) as ApiResponse<HabitLog[]>;

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
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
      const result = (await response.json()) as ApiResponse<
        CompletionSummary[] | StreakSummary[]
      >;

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to fetch ${type} analytics`
      );
      return type === "completion" ? [] : [];
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
      const result = (await response.json()) as ApiResponse<void>;

      if (result.error) {
        throw new Error(result.error.message);
      }
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
      const result = (await response.json()) as ApiResponse<void>;

      if (result.error) {
        throw new Error(result.error.message);
      }
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
