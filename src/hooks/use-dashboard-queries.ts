import { useQuery } from "@tanstack/react-query";
import { fetchHabits, fetchHabitLogs } from "~/lib/api";
import type { Habit, HabitLog } from "~/types";
import { FrequencyType } from "~/types/common/enums";

interface DashboardData {
  habits: Habit[];
  todayLogs: HabitLog[];
  recentLogs: HabitLog[];
}

export function useDashboardData(userId: string) {
  // Fetch habits
  const habitsQuery = useQuery({
    queryKey: ["habits", userId],
    queryFn: () => fetchHabits(userId),
  });

  // Fetch today's logs for all habits
  const todayLogsQuery = useQuery({
    queryKey: ["todayLogs", userId],
    queryFn: async () => {
      if (!habitsQuery.data) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayLogs = await Promise.all(
        habitsQuery.data.map((habit) =>
          fetchHabitLogs(habit.id, today, tomorrow)
        )
      );
      return todayLogs.flat();
    },
    enabled: !!habitsQuery.data,
  });

  // Fetch recent logs for all habits
  const recentLogsQuery = useQuery({
    queryKey: ["recentLogs", userId],
    queryFn: async () => {
      if (!habitsQuery.data) return [];

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 14);

      const recentLogs = await Promise.all(
        habitsQuery.data.map((habit) =>
          fetchHabitLogs(habit.id, startDate, endDate)
        )
      );
      return recentLogs.flat();
    },
    enabled: !!habitsQuery.data,
  });

  // Get today's habits based on frequency
  const getTodayHabits = () => {
    if (!habitsQuery.data) return [];

    const today = new Date().getDay();
    return habitsQuery.data.filter((habit) => {
      if (!habit.isActive || habit.isArchived) return false;

      if (habit.frequencyType === FrequencyType.Daily) return true;

      if (habit.frequencyType === FrequencyType.Weekly) {
        return habit.frequencyValue.days?.includes(today) ?? false;
      }

      if (habit.frequencyType === FrequencyType.Monthly) {
        return new Date().getDate() === 1;
      }

      return false;
    });
  };

  return {
    habits: habitsQuery.data ?? [],
    todayLogs: todayLogsQuery.data ?? [],
    recentLogs: recentLogsQuery.data ?? [],
    getTodayHabits,
    isLoading:
      habitsQuery.isLoading ??
      todayLogsQuery.isLoading ??
      recentLogsQuery.isLoading,
    error: habitsQuery.error ?? todayLogsQuery.error ?? recentLogsQuery.error,
  };
}
