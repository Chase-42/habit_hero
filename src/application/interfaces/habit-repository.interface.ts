import type { Result } from "../types";
import type {
  Habit,
  HabitLog,
  CreateHabit,
  HabitFilters,
  CompletionSummary,
  StreakSummary,
} from "../../entities/models/habit";
import type { ValidationError, NotFoundError } from "../../entities/errors";

export interface IHabitRepository {
  // Core CRUD operations
  create(habit: CreateHabit): Promise<Result<Habit, ValidationError>>;
  findById(id: string): Promise<Result<Habit, NotFoundError>>;
  findByUserId(userId: string): Promise<Result<Habit[], ValidationError>>;
  update(
    id: string,
    habit: Partial<Habit>
  ): Promise<Result<Habit, ValidationError | NotFoundError>>;
  delete(id: string): Promise<Result<void, NotFoundError>>;

  // Habit-specific operations
  findByFilters(
    filters: HabitFilters
  ): Promise<Result<Habit[], ValidationError>>;
  updateStreak(
    id: string,
    streak: number,
    longestStreak: number
  ): Promise<Result<void, NotFoundError>>;
  markAsCompleted(
    id: string,
    completedAt: Date
  ): Promise<Result<void, NotFoundError>>;

  // Habit Log operations
  createLog(
    log: Omit<HabitLog, "id" | "createdAt" | "updatedAt">
  ): Promise<Result<HabitLog, ValidationError>>;
  findLogsByHabitId(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<HabitLog[], ValidationError>>;
  deleteLog(id: string): Promise<Result<void, NotFoundError>>;

  // Analytics operations
  getCompletionSummary(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<CompletionSummary[], ValidationError>>;
  getStreakSummary(
    habitId: string
  ): Promise<Result<StreakSummary, ValidationError>>;
}
