import { z } from "zod";
import { injectable } from "tsyringe";
import { ValidationError } from "~/application/errors";
import type { Result } from "~/application/types";
import {
  HabitSchema,
  CreateHabitSchema,
  UpdateHabitSchema,
  type Habit,
  type CreateHabit,
  type UpdateHabit,
} from "~/entities/models/habit";
import {
  HabitLogSchema,
  CreateHabitLogSchema,
  UpdateHabitLogSchema,
  type HabitLog,
  type CreateHabitLog,
  type UpdateHabitLog,
} from "~/entities/models/habit-log";
import {
  GoalSchema,
  CreateGoalSchema,
  UpdateGoalSchema,
  type Goal,
  type CreateGoal,
  type UpdateGoal,
} from "~/entities/models/goal";

@injectable()
export class ValidationService {
  validateHabit(habit: unknown): Result<Habit, ValidationError> {
    const result = HabitSchema.safeParse(habit);
    if (!result.success) {
      return {
        ok: false,
        error: new ValidationError(result.error.message),
      };
    }
    return { ok: true, value: result.data };
  }

  validateCreateHabit(habit: unknown): Result<CreateHabit, ValidationError> {
    try {
      const result = CreateHabitSchema.safeParse(habit);
      if (!result.success) {
        return {
          ok: false,
          error: new ValidationError(result.error.message),
        };
      }
      return { ok: true, value: result.data };
    } catch (error) {
      return {
        ok: false,
        error: new ValidationError(
          error instanceof Error ? error.message : "Unknown error"
        ),
      };
    }
  }

  validateUpdateHabit(habit: unknown): Result<UpdateHabit, ValidationError> {
    const result = UpdateHabitSchema.safeParse(habit);
    if (!result.success) {
      return {
        ok: false,
        error: new ValidationError(result.error.message),
      };
    }
    return { ok: true, value: result.data };
  }

  validateHabitLog(log: unknown): Result<HabitLog, ValidationError> {
    const result = HabitLogSchema.safeParse(log);
    if (!result.success) {
      return {
        ok: false,
        error: new ValidationError(result.error.message),
      };
    }
    return { ok: true, value: result.data };
  }

  validateCreateHabitLog(
    log: unknown
  ): Result<CreateHabitLog, ValidationError> {
    const result = CreateHabitLogSchema.safeParse(log);
    if (!result.success) {
      return {
        ok: false,
        error: new ValidationError(result.error.message),
      };
    }
    return { ok: true, value: result.data };
  }

  validateUpdateHabitLog(
    log: unknown
  ): Result<UpdateHabitLog, ValidationError> {
    const result = UpdateHabitLogSchema.safeParse(log);
    if (!result.success) {
      return {
        ok: false,
        error: new ValidationError(result.error.message),
      };
    }
    return { ok: true, value: result.data };
  }

  validateGoal(goal: unknown): Result<Goal, ValidationError> {
    const result = GoalSchema.safeParse(goal);
    if (!result.success) {
      return {
        ok: false,
        error: new ValidationError(result.error.message),
      };
    }
    return { ok: true, value: result.data };
  }

  validateCreateGoal(goal: unknown): Result<CreateGoal, ValidationError> {
    const result = CreateGoalSchema.safeParse(goal);
    if (!result.success) {
      return {
        ok: false,
        error: new ValidationError(result.error.message),
      };
    }
    return { ok: true, value: result.data };
  }

  validateUpdateGoal(goal: unknown): Result<UpdateGoal, ValidationError> {
    const result = UpdateGoalSchema.safeParse(goal);
    if (!result.success) {
      return {
        ok: false,
        error: new ValidationError(result.error.message),
      };
    }
    return { ok: true, value: result.data };
  }
}
