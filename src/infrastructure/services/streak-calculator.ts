import type { Habit } from "~/entities/models/habit";
import type { HabitLog } from "~/entities/models/habit-log";
import type { IHabitLogRepository } from "~/application/interfaces/habit-log-repository";

export class StreakCalculator {
  constructor(private readonly habitLogRepository: IHabitLogRepository) {}

  async wasCompletedOnTime(habit: Habit, completedAt: Date): Promise<boolean> {
    // Get the most recent log before this completion
    const previousLogs = await this.habitLogRepository.findByHabitId(habit.id);
    const lastLog = previousLogs[0]; // Logs are ordered by completedAt desc
    const lastCompletionDate = lastLog?.completedAt ?? habit.createdAt;

    // If this is the first completion, it's always on time
    if (!lastLog) return true;

    const daysBetween = Math.floor(
      (completedAt.getTime() - lastCompletionDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    switch (habit.frequencyType) {
      case "daily":
        return daysBetween <= 1;
      case "weekly":
        return daysBetween <= 7;
      case "monthly":
        // Check if it's within the same month or the next month
        const lastMonth = lastCompletionDate.getMonth();
        const currentMonth = completedAt.getMonth();
        const monthDiff = (currentMonth - lastMonth + 12) % 12;
        return monthDiff <= 1;
      default:
        return false;
    }
  }

  async calculateNewStreak(
    habit: Habit,
    completedAt: Date
  ): Promise<{ streak: number; longestStreak: number }> {
    const isOnTime = await this.wasCompletedOnTime(habit, completedAt);
    const newStreak = isOnTime ? habit.streak + 1 : 1;
    const newLongestStreak = Math.max(habit.longestStreak, newStreak);

    return {
      streak: newStreak,
      longestStreak: newLongestStreak,
    };
  }
}
