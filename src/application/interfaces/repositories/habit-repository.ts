import type { Habit, CreateHabit, UpdateHabit } from "~/entities/models/habit";
import type { Result } from "~/application/types";
import type { NotFoundError, ValidationError } from "~/entities/errors";
import type { HabitLog } from "~/entities/models/habit-log";

export interface IHabitRepository {
  findById(id: string): Promise<Result<Habit, NotFoundError>>;
  findByUserId(userId: string): Promise<Result<Habit[], NotFoundError>>;
  findByCategory(
    userId: string,
    category: string
  ): Promise<Result<Habit[], ValidationError>>;
  findByStatus(
    userId: string,
    isCompleted: boolean
  ): Promise<Result<Habit[], ValidationError>>;
  create(data: CreateHabit): Promise<Result<Habit, ValidationError>>;
  update(
    id: string,
    data: UpdateHabit
  ): Promise<Result<Habit, ValidationError | NotFoundError>>;
  delete(id: string): Promise<Result<void, NotFoundError>>;
  exists(id: string): Promise<Result<boolean, NotFoundError>>;
  isOwnedBy(
    id: string,
    userId: string
  ): Promise<Result<boolean, NotFoundError>>;
  toggleStatus(
    id: string
  ): Promise<Result<Habit, ValidationError | NotFoundError>>;
  updateStreak(
    id: string,
    streak: number,
    longestStreak: number
  ): Promise<Result<Habit, ValidationError | NotFoundError>>;
  resetStreak(
    id: string
  ): Promise<Result<Habit, ValidationError | NotFoundError>>;
  archive(id: string): Promise<Result<Habit, ValidationError | NotFoundError>>;
  unarchive(
    id: string
  ): Promise<Result<Habit, ValidationError | NotFoundError>>;
  markAsCompleted(
    id: string,
    completedAt: Date
  ): Promise<Result<Habit, ValidationError | NotFoundError>>;
  markAsUncompleted(
    id: string
  ): Promise<Result<Habit, ValidationError | NotFoundError>>;
  getLogsByDateRange(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<HabitLog[], ValidationError | NotFoundError>>;
}
