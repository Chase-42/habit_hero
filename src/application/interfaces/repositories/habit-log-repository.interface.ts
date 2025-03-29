import type {
  HabitLog,
  CreateHabitLog,
  UpdateHabitLog,
  CompletionSummary,
  StreakSummary,
} from "~/entities/models/habit-log";
import type { Result } from "~/application/types";
import type { ValidationError, NotFoundError } from "~/entities/errors";

export interface IHabitLogRepository {
  // Core CRUD operations
  create(log: CreateHabitLog): Promise<Result<HabitLog, ValidationError>>;
  findById(id: string): Promise<Result<HabitLog, NotFoundError>>;
  findByHabitId(habitId: string): Promise<Result<HabitLog[], NotFoundError>>;
  findByUserId(userId: string): Promise<Result<HabitLog[], NotFoundError>>;
  update(
    id: string,
    log: UpdateHabitLog
  ): Promise<Result<HabitLog, ValidationError | NotFoundError>>;
  delete(id: string): Promise<Result<void, NotFoundError>>;

  // Analytics operations
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

  // Utility operations
  exists(id: string): Promise<Result<boolean, NotFoundError>>;
  isOwnedBy(
    id: string,
    userId: string
  ): Promise<Result<boolean, NotFoundError>>;
  findByDateRange(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<HabitLog[], ValidationError>>;
}
