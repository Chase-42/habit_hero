import { useState } from "react";
import { container } from "tsyringe";
import type { IHabitService } from "~/application/interfaces/habit-service";
import type { Habit, HabitFilters, HabitLog } from "~/entities/models/habit";
import type { CompletionSummary, StreakSummary } from "~/entities/types/habit";
import type { Result } from "~/application/types";
import type { ValidationError, NotFoundError } from "~/application/errors";

interface ErrorResponse {
  error: string;
  details?: unknown;
}

export function useHabits(userId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const habitService = container.resolve<IHabitService>("IHabitService");

  const fetchHabits = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await habitService.fetchHabits(userId);
      if (!result.ok) {
        throw new Error(result.error.message);
      }
      return result.value;
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
      const result = await habitService.fetchFilteredHabits(filters);
      if (!result.ok) {
        throw new Error(result.error.message);
      }
      return result.value;
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
      const result = await habitService.logHabit(log);
      if (!result.ok) {
        throw new Error(result.error.message);
      }
      return result.value;
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
      const result = await habitService.fetchHabitLogs(
        habitId,
        startDate,
        endDate
      );
      if (!result.ok) {
        throw new Error(result.error.message);
      }
      return result.value;
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
      const result = await habitService.fetchAnalytics(habitId, type, options);
      if (!result.ok) {
        throw new Error(result.error.message);
      }
      return result.value;
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
      const result = await habitService.updateHabit(habitId, updates);
      if (!result.ok) {
        throw new Error(result.error.message);
      }
      return result.value;
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
      const result = await habitService.deleteHabit(habitId);
      if (!result.ok) {
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
