import { useState, useCallback } from "react";
import type { HabitLog } from "~/entities/models/habit-log";
import { toast } from "sonner";

export function useHabitLogs(userId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHabitLogs = useCallback(
    async (
      habitId: string,
      startDate: Date,
      endDate: Date
    ): Promise<HabitLog[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          habitId,
          userId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

        const response = await fetch(`/api/habits/logs?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch habit logs");
        }

        return (await response.json()) as HabitLog[];
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch habit logs";
        setError(message);
        toast.error(message);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const deleteHabitLog = useCallback(
    async (logId: string, habitId: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          logId,
          habitId,
          userId,
        });

        const response = await fetch(`/api/habits/logs?${params}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete habit log");
        }

        toast.success("Habit log deleted successfully");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete habit log";
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  return {
    isLoading,
    error,
    fetchHabitLogs,
    deleteHabitLog,
  };
}
