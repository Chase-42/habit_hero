import type { Habit, HabitFilters } from "~/entities/models/habit";
import type { HabitLog } from "~/entities/models/habit-log";
import type { Result } from "~/application/types";
import type { ValidationError, NotFoundError } from "~/entities/errors";

export interface IHabitRepository {
  // Habit operations
  findById(id: string): Promise<Result<Habit, NotFoundError>>;
  findByUserId(
    userId: string,
    filters?: HabitFilters
  ): Promise<Result<Habit[], ValidationError>>;
  create(
    habit: Omit<
      Habit,
      "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
    >
  ): Promise<Result<Habit, ValidationError>>;
  update(
    id: string,
    habit: Partial<Omit<Habit, "id" | "createdAt" | "updatedAt">>
  ): Promise<Result<Habit, ValidationError | NotFoundError>>;
  delete(id: string): Promise<Result<void, NotFoundError>>;

  // Habit log operations
  addLog(
    id: string,
    log: Omit<HabitLog, "id" | "habitId" | "createdAt" | "updatedAt">
  ): Promise<Result<HabitLog, ValidationError | NotFoundError>>;
  getLogs(
    habitId: string
  ): Promise<Result<HabitLog[], ValidationError | NotFoundError>>;
  getLogsByDateRange(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<HabitLog[], ValidationError | NotFoundError>>;
}
