import type {
  HabitLog,
  CompletionSummary,
  StreakSummary,
} from "../../entities/models/habit-log";
import type {
  ValidationError,
  NotFoundError,
  RepositoryError,
} from "../../entities/errors";
import type { Result } from "../types";

export interface IHabitLogRepository {
  // Core CRUD operations
  create(log: Omit<HabitLog, "id">): Promise<Result<HabitLog, ValidationError>>;
  findById(id: string): Promise<Result<HabitLog, NotFoundError>>;
  update(
    id: string,
    log: Partial<HabitLog>
  ): Promise<Result<HabitLog, ValidationError | NotFoundError>>;
  delete(id: string): Promise<Result<void, NotFoundError>>;

  // Validation operations
  validate(log: Partial<HabitLog>): Promise<Result<true, ValidationError>>;
  exists(id: string): Promise<Result<boolean, NotFoundError>>;
  isOwnedBy(
    id: string,
    userId: string
  ): Promise<Result<boolean, NotFoundError>>;

  // Query operations
  findByHabitId(
    habitId: string
  ): Promise<Result<HabitLog[], ValidationError | NotFoundError>>;
  findByUserId(
    userId: string
  ): Promise<Result<HabitLog[], ValidationError | NotFoundError>>;
  findByDateRange(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<HabitLog[], ValidationError | NotFoundError>>;

  // Summary operations
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

  // Analytics operations
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
