import { useState, useCallback } from "react";
import type {
  CompletionSummary,
  StreakSummary,
} from "~/entities/models/habit-log";
import { toast } from "sonner";

export function useHabitAnalytics(userId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompletionSummaries = useCallback(
    async (
      habitId: string,
      startDate: Date,
      endDate: Date,
      groupBy: "day" | "week" | "month" = "day"
    ): Promise<CompletionSummary[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          habitId,
          userId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          groupBy,
        });

        const response = await fetch(
          `/api/habits/logs/completion-summaries?${params}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch completion summaries");
        }

        return (await response.json()) as CompletionSummary[];
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to fetch completion summaries";
        setError(message);
        toast.error(message);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const fetchStreakSummaries = useCallback(
    async (
      habitId: string,
      startDate: Date,
      endDate: Date
    ): Promise<StreakSummary[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          habitId,
          userId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

        const response = await fetch(
          `/api/habits/logs/streak-summaries?${params}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch streak summaries");
        }

        return (await response.json()) as StreakSummary[];
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to fetch streak summaries";
        setError(message);
        toast.error(message);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const fetchCompletionRate = useCallback(
    async (
      habitId: string,
      startDate: Date,
      endDate: Date
    ): Promise<number> => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          habitId,
          userId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

        const response = await fetch(
          `/api/habits/logs/completion-rate?${params}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch completion rate");
        }

        const data = await response.json();
        return data.rate as number;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to fetch completion rate";
        setError(message);
        toast.error(message);
        return 0;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const fetchAverageDifficulty = useCallback(
    async (
      habitId: string,
      startDate: Date,
      endDate: Date
    ): Promise<number> => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          habitId,
          userId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

        const response = await fetch(
          `/api/habits/logs/average-difficulty?${params}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch average difficulty");
        }

        const data = await response.json();
        return data.average as number;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to fetch average difficulty";
        setError(message);
        toast.error(message);
        return 0;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  return {
    isLoading,
    error,
    fetchCompletionSummaries,
    fetchStreakSummaries,
    fetchCompletionRate,
    fetchAverageDifficulty,
  };
}
