import type {
  Habit,
  HabitFilters,
  HabitLog,
} from "../../entities/models/habit";
import type {
  CompletionSummary,
  StreakSummary,
} from "../../entities/types/habit";
import type { Result } from "../types";
import type { ValidationError, NotFoundError } from "../errors";

export interface IHabitService {
  fetchHabits(userId: string): Promise<Result<Habit[], NotFoundError>>;
  fetchFilteredHabits(
    filters: HabitFilters
  ): Promise<Result<Habit[], NotFoundError>>;
  logHabit(
    log: Omit<HabitLog, "id">
  ): Promise<Result<HabitLog, ValidationError>>;
  fetchHabitLogs(
    habitId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Result<HabitLog[], NotFoundError>>;
  fetchAnalytics(
    habitId: string,
    type: "completion" | "streak",
    options?: {
      groupBy?: "day" | "week" | "month";
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<Result<CompletionSummary[] | StreakSummary[], NotFoundError>>;
  updateHabit(
    habitId: string,
    updates: Partial<Omit<Habit, "id" | "createdAt">>
  ): Promise<Result<Habit, ValidationError | NotFoundError>>;
  deleteHabit(habitId: string): Promise<Result<void, NotFoundError>>;
}
