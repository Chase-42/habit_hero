import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchHabitLogs } from "~/lib/api";
import type { HabitLog } from "~/types";

interface UseHabitLogsProps {
  habitId: string;
  startDate: Date;
  endDate: Date;
}

export function useHabitLogs({
  habitId,
  startDate,
  endDate,
}: UseHabitLogsProps) {
  return useQuery({
    queryKey: [
      "habitLogs",
      habitId,
      startDate.toISOString(),
      endDate.toISOString(),
    ],
    queryFn: () => fetchHabitLogs(habitId, startDate, endDate),
  });
}

export function useTodayHabitLogs(habitId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return useHabitLogs({
    habitId,
    startDate: today,
    endDate: tomorrow,
  });
}

export function useRecentHabitLogs(habitId: string) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 14);

  return useHabitLogs({
    habitId,
    startDate,
    endDate,
  });
}

// Mutation for toggling habit completion
export function useToggleHabitLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      habitId,
      isCompleted,
    }: {
      habitId: string;
      isCompleted: boolean;
    }) => {
      const response = await fetch(`/api/habits/${habitId}/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isCompleted }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle habit");
      }

      return response.json();
    },
    onSuccess: (_, { habitId }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["habitLogs", habitId] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}
