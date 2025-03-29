import { type Result } from "~/application/types";
import { type NotFoundError, type ValidationError } from "~/entities/errors";
import {
  type HabitLog,
  type CompletionSummary,
  type StreakSummary,
} from "~/entities/types/habit-log";

export interface IHabitLogRepository {
  findByUserId(userId: string): Promise<Result<HabitLog[], NotFoundError>>;
  findById(id: string): Promise<Result<HabitLog, NotFoundError>>;
  create(log: Omit<HabitLog, "id">): Promise<Result<HabitLog, ValidationError>>;
  update(
    id: string,
    updates: Partial<HabitLog>
  ): Promise<Result<HabitLog, ValidationError | NotFoundError>>;
  delete(id: string): Promise<Result<void, NotFoundError>>;
  validate(log: Partial<HabitLog>): Promise<Result<true, ValidationError>>;
  exists(id: string): Promise<Result<boolean, NotFoundError>>;
  isOwnedBy(
    id: string,
    userId: string
  ): Promise<Result<boolean, NotFoundError>>;
  findByHabitId(habitId: string): Promise<Result<HabitLog[], NotFoundError>>;
  findByDateRange(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<HabitLog[], ValidationError>>;
  getCompletionSummaries(
    habitId: string,
    startDate: Date,
    endDate: Date,
    groupBy?: "day" | "week" | "month"
  ): Promise<Result<CompletionSummary[], ValidationError | NotFoundError>>;
  getStreakSummaries(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<StreakSummary[], ValidationError | NotFoundError>>;
  getCompletionRate(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<number, ValidationError | NotFoundError>>;
  getAverageDifficulty(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<number, ValidationError | NotFoundError>>;
}
