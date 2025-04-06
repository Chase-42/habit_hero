import { type IDashboardRepository } from "~/application/dashboard/interfaces";
import { DashboardStatsError } from "~/entities/dashboard/errors";
import type { Habit, HabitLog } from "~/types";
import type {
  DashboardStats,
  DashboardFilters,
} from "~/entities/dashboard/types";
import { fetchHabits, fetchHabitLogs } from "~/lib/api-client";
import { startOfDay } from "date-fns";

export class DashboardRepository implements IDashboardRepository {
  async getHabits(userId: string): Promise<Habit[]> {
    return fetchHabits(userId);
  }

  async getHabitLogs(
    userId: string,
    filters: DashboardFilters
  ): Promise<HabitLog[]> {
    const { startDate, endDate } = filters;
    const habits = await this.getHabits(userId);

    const logs = await Promise.all(
      habits.map((habit) => fetchHabitLogs(habit.id, startDate, endDate))
    );

    return logs.flat();
  }

  async getStats(
    userId: string,
    filters: DashboardFilters
  ): Promise<DashboardStats> {
    try {
      const [habits, logs] = await Promise.all([
        this.getHabits(userId),
        this.getHabitLogs(userId, filters),
      ]);

      const today = startOfDay(new Date());
      const activeHabits = habits.filter((h) => !h.isArchived && h.isActive);

      // Calculate completed habits for today
      const completedToday = activeHabits.filter((habit) =>
        logs.some((log) => {
          const completedAt = new Date(log.completedAt);
          return (
            startOfDay(completedAt).getTime() === today.getTime() &&
            log.habitId === habit.id
          );
        })
      );

      // Calculate weekly progress
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 6);

      const weeklyLogs = logs.filter((log) => {
        const completedAt = new Date(log.completedAt);
        return completedAt >= weekStart && completedAt <= today;
      });

      const totalPossibleCompletions = activeHabits.length * 7;
      const weeklyProgress =
        totalPossibleCompletions > 0
          ? Math.round((weeklyLogs.length / totalPossibleCompletions) * 100)
          : 0;

      return {
        totalHabits: activeHabits.length,
        completedToday: completedToday.length,
        weeklyProgress,
        currentStreak: Math.max(...activeHabits.map((h) => h.streak || 0)),
      };
    } catch (error) {
      throw new DashboardStatsError(
        error instanceof Error
          ? error.message
          : "Failed to calculate dashboard stats"
      );
    }
  }
}
