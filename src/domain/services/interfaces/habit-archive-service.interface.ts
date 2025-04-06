import { type Habit } from "../../entities/habit";

export interface IHabitArchiveService {
  /**
   * Archive a habit
   */
  archiveHabit(habit: Habit): Habit;

  /**
   * Unarchive a habit
   */
  unarchiveHabit(habit: Habit): Habit;
}
