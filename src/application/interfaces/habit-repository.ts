import type { Habit } from "../../entities/models/habit";
import type { HabitLog } from "../../entities/models/habit-log";
import type { ValidationError, NotFoundError } from "../../entities/errors";
import type { Result } from "../types";

export interface IHabitRepository {
  // Core CRUD operations
  create(habit: Omit<Habit, "id">): Promise<Result<Habit, ValidationError>>;
  findById(id: string): Promise<Result<Habit, NotFoundError>>;
  update(
    id: string,
    habit: Partial<Habit>
  ): Promise<Result<Habit, ValidationError | NotFoundError>>;
  delete(id: string): Promise<Result<void, NotFoundError>>;

  // Validation operations
  validate(habit: Partial<Habit>): Promise<Result<true, ValidationError>>;
  exists(id: string): Promise<Result<boolean, NotFoundError>>;
  isOwnedBy(
    id: string,
    userId: string
  ): Promise<Result<boolean, NotFoundError>>;

  // Query operations
  findByUserId(
    userId: string
  ): Promise<Result<Habit[], ValidationError | NotFoundError>>;
  findByFilters(filters: {
    userId?: string;
    name?: string;
    category?: string;
    tags?: string[];
    isArchived?: boolean;
  }): Promise<Result<Habit[], ValidationError | NotFoundError>>;

  // Streak operations
  updateStreak(
    id: string,
    streak: number,
    longestStreak: number
  ): Promise<Result<Habit, ValidationError | NotFoundError>>;
  resetStreak(
    id: string
  ): Promise<Result<Habit, ValidationError | NotFoundError>>;

  // Status operations
  archive(id: string): Promise<Result<Habit, ValidationError | NotFoundError>>;
  unarchive(
    id: string
  ): Promise<Result<Habit, ValidationError | NotFoundError>>;

  // Completion operations
  markAsCompleted(
    id: string,
    completedAt: Date
  ): Promise<Result<Habit, ValidationError | NotFoundError>>;
  markAsUncompleted(
    id: string
  ): Promise<Result<Habit, ValidationError | NotFoundError>>;

  // Log operations
  addLog(
    id: string,
    log: Omit<HabitLog, "id" | "habitId">
  ): Promise<Result<HabitLog, ValidationError | NotFoundError>>;
  removeLog(
    id: string,
    logId: string
  ): Promise<Result<void, ValidationError | NotFoundError>>;
}
