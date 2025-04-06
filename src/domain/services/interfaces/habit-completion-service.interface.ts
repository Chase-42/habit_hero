import { type Habit } from "../../entities/habit";
import { type HabitLog } from "../../entities/habit-log";

export interface IHabitCompletionService {
  /**
   * Checks if a habit was completed on time based on its frequency type
   */
  wasHabitCompletedOnTime(
    habit: Habit,
    completedAt: Date,
    lastCompletionDate: Date
  ): boolean;

  /**
   * Completes a habit and returns the updated habit
   */
  completeHabit(habit: Habit, completedAt: Date, notes?: string): Habit;

  /**
   * Creates a habit log for a completed habit
   */
  createHabitLog(habit: Habit, completedAt: Date, notes?: string): HabitLog;
}
