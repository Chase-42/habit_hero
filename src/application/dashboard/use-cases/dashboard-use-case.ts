import {
  type IDashboardRepository,
  type IDashboardUseCase,
} from "../interfaces";
import {
  DashboardStatsError,
  DashboardDataError,
} from "~/entities/dashboard/errors";
import type { Habit, HabitLog } from "~/types";
import type { DashboardFilters } from "~/entities/dashboard/types";

export class DashboardUseCase implements IDashboardUseCase {
  constructor(private readonly repository: IDashboardRepository) {}

  async getDashboardData(userId: string, filters: DashboardFilters) {
    try {
      const [habits, habitLogs, stats] = await Promise.all([
        this.repository.getHabits(userId),
        this.repository.getHabitLogs(userId, filters),
        this.repository.getStats(userId, filters),
      ]);

      return { habits, habitLogs, stats };
    } catch (error) {
      throw new DashboardDataError(
        error instanceof Error
          ? error.message
          : "Failed to fetch dashboard data"
      );
    }
  }

  async toggleHabitCompletion(habitId: string) {
    try {
      // Implementation will be moved from dashboard-content.tsx
    } catch (error) {
      throw new DashboardDataError(
        error instanceof Error
          ? error.message
          : "Failed to toggle habit completion"
      );
    }
  }

  async deleteHabit(habitId: string) {
    try {
      // Implementation will be moved from dashboard-content.tsx
    } catch (error) {
      throw new DashboardDataError(
        error instanceof Error ? error.message : "Failed to delete habit"
      );
    }
  }

  async createHabit(
    habit: Omit<
      Habit,
      "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
    >
  ): Promise<Habit> {
    try {
      // Implementation will be moved from dashboard-content.tsx
      throw new Error("Not implemented");
    } catch (error) {
      throw new DashboardDataError(
        error instanceof Error ? error.message : "Failed to create habit"
      );
    }
  }
}
