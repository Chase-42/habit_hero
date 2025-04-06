import { type Habit } from "../../entities/habit";
import { type HabitLog } from "../../entities/habit-log";
import { type StreakSummary } from "../streak-calculation-service";

export interface IStreakCalculationService {
  /**
   * Calculates whether a habit was completed on time based on its frequency type
   */
  wasHabitCompletedOnTime(
    habit: Habit,
    completedAt: Date,
    lastCompletionDate: Date
  ): boolean;

  /**
   * Calculates the streak history for a habit based on its completion logs
   */
  calculateStreakHistory(habit: Habit, logs: HabitLog[]): StreakSummary[];

  /**
   * Calculates the current streak for a habit based on its most recent log
   */
  calculateCurrentStreak(habit: Habit, logs: HabitLog[]): number;

  /**
   * Calculates the longest streak for a habit based on its completion logs
   */
  calculateLongestStreak(habit: Habit, logs: HabitLog[]): number;
}
