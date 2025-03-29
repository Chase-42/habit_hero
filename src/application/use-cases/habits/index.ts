import type { Habit, CreateHabit, UpdateHabit } from "~/entities/models/habit";
import type { Result } from "~/application/types";
import type { NotFoundError, ValidationError } from "~/entities/errors";

export interface GetHabitUseCase {
  execute(params: { id: string }): Promise<Result<Habit, NotFoundError>>;
}

export interface GetHabitsUseCase {
  execute(params: { userId: string }): Promise<Result<Habit[], NotFoundError>>;
}

export interface CreateHabitUseCase {
  execute(params: {
    data: CreateHabit;
  }): Promise<Result<Habit, ValidationError>>;
}

export interface UpdateHabitUseCase {
  execute(params: {
    id: string;
    data: UpdateHabit;
  }): Promise<Result<Habit, ValidationError | NotFoundError>>;
}

export interface DeleteHabitUseCase {
  execute(params: { id: string }): Promise<Result<void, NotFoundError>>;
}

export interface ToggleHabitUseCase {
  execute(
    id: string,
    userId: string,
    completed: boolean
  ): Promise<Result<Habit, ValidationError | NotFoundError>>;
}
