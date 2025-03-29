import type { Habit, HabitLog } from "../../entities/models";
import type { Result } from "../types";
import type { ValidationError, NotFoundError } from "../../entities/errors";

export interface IHabitApiClient {
  fetchHabits(userId: string): Promise<Result<Habit[], ValidationError>>;
  createHabit(
    habit: Omit<
      Habit,
      "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
    >
  ): Promise<Result<Habit, ValidationError>>;
  completeHabit(
    habit: Habit
  ): Promise<Result<void, ValidationError | NotFoundError>>;
  fetchHabitLogs(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<HabitLog[], ValidationError>>;
  fetchTodaysLogs(
    habitId: string
  ): Promise<Result<HabitLog[], ValidationError>>;
  deleteHabitLog(
    habitId: string,
    date: Date
  ): Promise<Result<void, ValidationError | NotFoundError>>;
  toggleHabit(
    habit: Habit,
    isCompleted: boolean
  ): Promise<Result<void, ValidationError | NotFoundError>>;
  deleteHabit(
    habitId: string,
    userId: string
  ): Promise<Result<void, ValidationError | NotFoundError>>;
}
