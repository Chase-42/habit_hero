import { injectable, inject } from "tsyringe";
import type { Result } from "~/application/types";
import type { HabitLog } from "~/entities/models/habit-log";
import { ValidationError, NotFoundError } from "~/entities/errors";
import type { IHabitRepository } from "~/application/interfaces/repositories/habit-repository.interface";
import type { IHabitLogRepository } from "~/application/interfaces/repositories/habit-log-repository.interface";

@injectable()
export class GetHabitLogsUseCase {
  constructor(
    @inject("IHabitRepository")
    private readonly habitRepository: IHabitRepository,
    @inject("IHabitLogRepository")
    private readonly habitLogRepository: IHabitLogRepository
  ) {}

  async execute(
    habitId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Result<HabitLog[], ValidationError | NotFoundError>> {
    // Validate input
    if (!habitId || !userId) {
      return {
        ok: false,
        error: new ValidationError("Habit ID and User ID are required"),
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

    // Get logs
    if (startDate && endDate) {
      return this.habitLogRepository.findByDateRange(
        habitId,
        startDate,
        endDate
      );
    }

    return this.habitLogRepository.findByHabitId(habitId);
  }
}
