import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { container } from "~/di/container";
import type {
  DashboardState,
  DashboardFilters,
} from "~/entities/dashboard/types";
import { DashboardDataError } from "~/entities/dashboard/errors";
import { toast } from "sonner";
import type { Habit } from "~/types";
import { type IDashboardUseCase } from "~/application/dashboard/interfaces";

export function useDashboard() {
  const { user } = useUser();
  const [state, setState] = useState<DashboardState>({
    habits: [],
    habitLogs: [],
    isLoading: true,
    error: null,
  });

  const dashboardUseCase =
    container.resolve<IDashboardUseCase>("DashboardUseCase");

  const fetchDashboardData = useCallback(
    async (filters: DashboardFilters) => {
      if (!user?.id) return;

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const data = await dashboardUseCase.getDashboardData(user.id, filters);
        setState((prev) => ({
          ...prev,
          habits: data.habits,
          habitLogs: data.habitLogs,
          isLoading: false,
        }));
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard data";
        setState((prev) => ({
          ...prev,
          error: new DashboardDataError(message),
          isLoading: false,
        }));
        toast.error(message);
      }
    },
    [user?.id]
  );

  const toggleHabitCompletion = useCallback(
    async (habit: Habit) => {
      try {
        await dashboardUseCase.toggleHabitCompletion(habit.id);
        // Refresh data after toggle
        const today = new Date();
        const filters: DashboardFilters = {
          startDate: new Date(today.getFullYear(), today.getMonth(), 1),
          endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0),
          showArchived: false,
        };
        await fetchDashboardData(filters);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to toggle habit";
        toast.error(message);
      }
    },
    [fetchDashboardData]
  );

  const deleteHabit = useCallback(
    async (habitId: string) => {
      try {
        await dashboardUseCase.deleteHabit(habitId);
        // Refresh data after delete
        const today = new Date();
        const filters: DashboardFilters = {
          startDate: new Date(today.getFullYear(), today.getMonth(), 1),
          endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0),
          showArchived: false,
        };
        await fetchDashboardData(filters);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete habit";
        toast.error(message);
      }
    },
    [fetchDashboardData]
  );

  const createHabit = useCallback(
    async (
      habit: Omit<
        Habit,
        "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
      >
    ) => {
      try {
        await dashboardUseCase.createHabit(habit);
        // Refresh data after create
        const today = new Date();
        const filters: DashboardFilters = {
          startDate: new Date(today.getFullYear(), today.getMonth(), 1),
          endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0),
          showArchived: false,
        };
        await fetchDashboardData(filters);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create habit";
        toast.error(message);
      }
    },
    [fetchDashboardData]
  );

  useEffect(() => {
    const today = new Date();
    const filters: DashboardFilters = {
      startDate: new Date(today.getFullYear(), today.getMonth(), 1),
      endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0),
      showArchived: false,
    };
    void fetchDashboardData(filters);
  }, [fetchDashboardData]);

  return {
    ...state,
    toggleHabitCompletion,
    deleteHabit,
    createHabit,
    fetchDashboardData,
  };
}
