import type { IHabitRepository } from "../interfaces/habit-repository";
import type { Habit } from "../../entities/models/habit";
import type { Result } from "../types";
import { err, ok } from "../types";
import { NotFoundError, ValidationError } from "../../entities/errors";
import { injectable, inject } from "tsyringe";

@injectable()
export class LogHabitUseCase {
  constructor(
    @inject("IHabitRepository")
    private readonly habitRepository: IHabitRepository
  ) {}

  async execute(
    habitId: string,
    userId: string
  ): Promise<Result<void, NotFoundError | ValidationError>> {
    try {
      const habit = await this.habitRepository.findById(habitId);
      if (!habit.ok) {
        return { ok: false, error: new NotFoundError("Habit", habitId) };
      }

      // Verify ownership
      if (habit.value.userId !== userId) {
        return {
          ok: false,
          error: new ValidationError("Unauthorized to log this habit"),
        };
      }

      const result = await this.habitRepository.createLog({
        habitId,
        userId,
        completedAt: new Date(),
        value: null,
        notes: null,
        details: null,
        difficulty: null,
        feeling: null,
        hasPhoto: false,
        photoUrl: null,
      });

      if (!result.ok) {
        return { ok: false, error: new ValidationError("Failed to log habit") };
      }

      return { ok: true, value: undefined };
    } catch (error) {
      if (error instanceof Error) {
        return { ok: false, error: new ValidationError(error.message) };
      }
      throw error;
    }
  }
}
