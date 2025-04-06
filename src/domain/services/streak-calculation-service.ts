import { type Habit } from "../entities/habit";
import { type HabitLog } from "../entities/habit-log";
import { FrequencyType } from "../enums/frequency-type";
import { type IStreakCalculationService } from "./interfaces/streak-calculation-service.interface";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";

export interface StreakSummary {
  date: Date;
  streak: number;
  wasStreakBroken: boolean;
}

export class StreakCalculationService implements IStreakCalculationService {
  /**
   * Calculates whether a habit was completed on time based on its frequency type
   */
  public wasHabitCompletedOnTime(
    habit: Habit,
    completedAt: Date,
    lastCompletionDate: Date
  ): boolean {
    switch (habit.frequencyType) {
      case FrequencyType.DAILY:
        return isWithinInterval(completedAt, {
          start: startOfDay(lastCompletionDate),
          end: endOfDay(lastCompletionDate),
        });
      case FrequencyType.WEEKLY:
        return isWithinInterval(completedAt, {
          start: startOfWeek(lastCompletionDate),
          end: endOfWeek(lastCompletionDate),
        });
      case FrequencyType.MONTHLY:
        return isWithinInterval(completedAt, {
          start: startOfMonth(lastCompletionDate),
          end: endOfMonth(lastCompletionDate),
        });
      case FrequencyType.CUSTOM:
        // TODO: Implement custom frequency logic
        return true;
      default:
        return false;
    }
  }

  /**
   * Calculates the streak history for a habit based on its completion logs
   */
  public calculateStreakHistory(
    habit: Habit,
    logs: HabitLog[]
  ): StreakSummary[] {
    if (!logs || logs.length === 0) return [];

    const streakHistory: StreakSummary[] = [];
    let currentStreak = 0;

    for (const currentLog of logs) {
      const previousLog =
        streakHistory.length > 0 ? logs[logs.indexOf(currentLog) - 1] : null;

      // For the first log, check against habit creation date
      if (!previousLog) {
        const isOnTime = this.wasHabitCompletedOnTime(
          habit,
          currentLog.completedAt,
          habit.createdAt
        );
        currentStreak = isOnTime ? 1 : 0;
        streakHistory.push({
          date: currentLog.completedAt,
          streak: currentStreak,
          wasStreakBroken: !isOnTime,
        });
        continue;
      }

      // For subsequent logs, check against the previous log's date
      const isOnTime = this.wasHabitCompletedOnTime(
        habit,
        currentLog.completedAt,
        previousLog.completedAt
      );

      if (isOnTime) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }

      streakHistory.push({
        date: currentLog.completedAt,
        streak: currentStreak,
        wasStreakBroken: !isOnTime,
      });
    }

    return streakHistory;
  }

  /**
   * Calculates the current streak for a habit based on its most recent log
   */
  public calculateCurrentStreak(habit: Habit, logs: HabitLog[]): number {
    if (!logs || logs.length === 0) return 0;

    const streakHistory = this.calculateStreakHistory(habit, logs);
    return streakHistory[streakHistory.length - 1]?.streak ?? 0;
  }

  /**
   * Calculates the longest streak for a habit based on its completion logs
   */
  public calculateLongestStreak(habit: Habit, logs: HabitLog[]): number {
    if (!logs || logs.length === 0) return 0;

    const streakHistory = this.calculateStreakHistory(habit, logs);
    return Math.max(...streakHistory.map((summary) => summary.streak));
  }
}
