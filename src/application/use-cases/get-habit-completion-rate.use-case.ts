import { injectable } from "tsyringe";
import type { IHabitRepository } from "../interfaces/repositories/habit-repository";
import type { Result } from "../types";
import { NotFoundError, ValidationError } from "~/entities/errors";
import { ok, err } from "../types";

interface GetHabitCompletionRateParams {
  habitId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
}

interface CompletionRate {
  totalDays: number;
  completedDays: number;
  rate: number;
}

@injectable()
export class GetHabitCompletionRateUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(
    params: GetHabitCompletionRateParams
  ): Promise<Result<CompletionRate, NotFoundError | ValidationError>> {
    try {
      const { habitId, userId, startDate, endDate } = params;

      // Verify habit exists and belongs to user
      const habitResult = await this.habitRepository.findById(habitId);
      if (!habitResult.ok) {
        return err(new NotFoundError("Habit", habitId));
      }

      const habit = habitResult.value;
      if (habit.userId !== userId) {
        return err(new ValidationError("Habit does not belong to user"));
      }

      // Get logs for the date range
      const logsResult = await this.habitRepository.getLogsByDateRange(
        habitId,
        startDate,
        endDate
      );
      if (!logsResult.ok) {
        return err(logsResult.error);
      }

      const logs = logsResult.value;
      const totalDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const completedDays = logs.length;

      return ok({
        totalDays,
        completedDays,
        rate: totalDays > 0 ? completedDays / totalDays : 0,
      });
    } catch (error) {
      return err(
        new ValidationError(
          error instanceof Error
            ? error.message
            : "Failed to calculate completion rate"
        )
      );
    }
  }
}
