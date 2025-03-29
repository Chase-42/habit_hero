import type { Goal, CreateGoal, UpdateGoal } from "~/entities/models/goal";
import type { Habit, CreateHabit, UpdateHabit } from "~/entities/models/habit";
import type {
  HabitLog,
  CreateHabitLog,
  UpdateHabitLog,
} from "~/entities/models/habit-log";
import type { Result } from "~/application/types";
import type { NotFoundError, ValidationError } from "~/entities/errors";

export interface IGoalRepository {
  findById(id: number): Promise<Result<Goal, NotFoundError>>;
  findByUserId(userId: string): Promise<Result<Goal[], NotFoundError>>;
  create(data: CreateGoal): Promise<Result<Goal, ValidationError>>;
  update(
    id: number,
    data: UpdateGoal
  ): Promise<Result<Goal, ValidationError | NotFoundError>>;
  delete(id: number): Promise<Result<void, NotFoundError>>;
  validate(goal: Partial<Goal>): Promise<Result<true, ValidationError>>;
  exists(id: number): Promise<Result<boolean, NotFoundError>>;
  isOwnedBy(
    id: number,
    userId: string
  ): Promise<Result<boolean, NotFoundError>>;
  findAll(): Promise<Result<Goal[], NotFoundError>>;
}

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
}

export interface IHabitLogRepository {
  findById(id: string): Promise<Result<HabitLog, NotFoundError>>;
  findByHabitId(habitId: string): Promise<Result<HabitLog[], NotFoundError>>;
  findByUserId(userId: string): Promise<Result<HabitLog[], NotFoundError>>;
  create(data: CreateHabitLog): Promise<Result<HabitLog, ValidationError>>;
  update(
    id: string,
    data: UpdateHabitLog
  ): Promise<Result<HabitLog, ValidationError | NotFoundError>>;
  delete(id: string): Promise<Result<void, NotFoundError>>;
  exists(id: string): Promise<Result<boolean, NotFoundError>>;
  isOwnedBy(
    id: string,
    userId: string
  ): Promise<Result<boolean, NotFoundError>>;
}
