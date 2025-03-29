import { injectable, inject } from "tsyringe";
import type { Result } from "~/application/types";
import { ValidationError, NotFoundError } from "~/entities/errors";
import type { IHabitRepository } from "~/application/interfaces/repositories/habit-repository.interface";
import type { IHabitLogRepository } from "~/application/interfaces/repositories/habit-log-repository.interface";

@injectable()
export class DeleteHabitLogUseCase {
  constructor(
    @inject("IHabitRepository")
    private readonly habitRepository: IHabitRepository,
    @inject("IHabitLogRepository")
    private readonly habitLogRepository: IHabitLogRepository
  ) {}

  async execute(
    logId: string,
    habitId: string,
    userId: string
  ): Promise<Result<void, ValidationError | NotFoundError>> {
    // Validate input
    if (!logId || !habitId || !userId) {
      return {
        ok: false,
        error: new ValidationError(
          "Log ID, Habit ID, and User ID are required"
        ),
      };
    }

    // Check if habit exists and belongs to user
    const habitResult = await this.habitRepository.findById(habitId);
    if (!habitResult.ok) {
      return {
        ok: false,
        error: habitResult.error,
      };
    }

    if (habitResult.value.userId !== userId) {
      return {
        ok: false,
        error: new NotFoundError("Habit", habitId),
      };
    }

    // Check if log exists and belongs to habit
    const logResult = await this.habitLogRepository.findById(logId);
    if (!logResult.ok) {
      return {
        ok: false,
        error: logResult.error,
      };
    }

    if (logResult.value.habitId !== habitId) {
      return {
        ok: false,
        error: new NotFoundError("Habit Log", logId),
      };
    }

    // Delete log
    return this.habitLogRepository.delete(logId);
  }
}
