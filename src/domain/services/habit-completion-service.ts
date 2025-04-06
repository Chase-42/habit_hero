import { type Habit } from "../entities/habit";
import { HabitLog } from "../entities/habit-log";
import { FrequencyType } from "../enums/frequency-type";
import { type IHabitCompletionService } from "./interfaces/habit-completion-service.interface";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";

export class HabitCompletionService implements IHabitCompletionService {
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

  public completeHabit(habit: Habit, completedAt: Date, notes?: string): Habit {
    return habit.complete(completedAt);
  }

  public createHabitLog(
    habit: Habit,
    completedAt: Date,
    notes?: string
  ): HabitLog {
    return HabitLog.create({
      habitId: habit.id,
      userId: habit.userId,
      notes,
    });
  }
}
