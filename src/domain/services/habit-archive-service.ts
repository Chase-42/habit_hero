import { type Habit } from "../entities/habit";
import { type IHabitArchiveService } from "./interfaces/habit-archive-service.interface";

export class HabitArchiveService implements IHabitArchiveService {
  public archiveHabit(habit: Habit): Habit {
    return habit.update({
      isArchived: true,
      isActive: false, // When a habit is archived, it should also be inactive
    });
  }

  public unarchiveHabit(habit: Habit): Habit {
    return habit.update({
      isArchived: false,
      isActive: true, // When a habit is unarchived, it should be active by default
    });
  }
}
