import type { Habit, HabitLog } from "~/types";
import type {
  DashboardStats,
  DashboardFilters,
} from "~/entities/dashboard/types";

export interface IDashboardRepository {
  getHabits(userId: string): Promise<Habit[]>;
  getHabitLogs(userId: string, filters: DashboardFilters): Promise<HabitLog[]>;
  getStats(userId: string, filters: DashboardFilters): Promise<DashboardStats>;
}

export interface IDashboardUseCase {
  getDashboardData(
    userId: string,
    filters: DashboardFilters
  ): Promise<{
    habits: Habit[];
    habitLogs: HabitLog[];
    stats: DashboardStats;
  }>;
  toggleHabitCompletion(habitId: string): Promise<void>;
  deleteHabit(habitId: string): Promise<void>;
  createHabit(
    habit: Omit<
      Habit,
      "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
    >
  ): Promise<Habit>;
}
