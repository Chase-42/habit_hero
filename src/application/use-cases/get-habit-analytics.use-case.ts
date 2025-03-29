import { injectable, inject } from "tsyringe";
import type { Result } from "~/application/types";
import type {
  CompletionSummary,
  StreakSummary,
} from "~/entities/models/habit-log";
import { ValidationError, NotFoundError } from "~/entities/errors";
import type { IHabitRepository } from "~/application/interfaces/repositories/habit-repository.interface";
import type { IHabitLogRepository } from "~/application/interfaces/repositories/habit-log-repository.interface";

@injectable()
export class GetHabitAnalyticsUseCase {
  constructor(
    @inject("IHabitRepository")
    private readonly habitRepository: IHabitRepository,
    @inject("IHabitLogRepository")
    private readonly habitLogRepository: IHabitLogRepository
  ) {}

  async getCompletionSummaries(
    habitId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date,
    groupBy: "day" | "week" | "month" = "day"
  ): Promise<Result<CompletionSummary[], ValidationError | NotFoundError>> {
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

    // Get completion summaries
    const defaultStartDate = startDate ?? new Date(0); // Beginning of time
    const defaultEndDate = endDate ?? new Date(); // Current time

    return this.habitLogRepository.getCompletionSummaries(
      habitId,
      defaultStartDate,
      defaultEndDate,
      groupBy
    );
  }

  async getStreakSummaries(
    habitId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Result<StreakSummary[], ValidationError | NotFoundError>> {
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

    // Get streak summaries
    const defaultStartDate = startDate ?? new Date(0); // Beginning of time
    const defaultEndDate = endDate ?? new Date(); // Current time

    return this.habitLogRepository.getStreakSummaries(
      habitId,
      defaultStartDate,
      defaultEndDate
    );
  }

  async getCompletionRate(
    habitId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Result<number, ValidationError | NotFoundError>> {
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

    // Get completion rate
    const defaultStartDate = startDate ?? new Date(0); // Beginning of time
    const defaultEndDate = endDate ?? new Date(); // Current time

    return this.habitLogRepository.getCompletionRate(
      habitId,
      defaultStartDate,
      defaultEndDate
    );
  }

  async getAverageDifficulty(
    habitId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Result<number, ValidationError | NotFoundError>> {
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

    // Get average difficulty
    const defaultStartDate = startDate ?? new Date(0); // Beginning of time
    const defaultEndDate = endDate ?? new Date(); // Current time

    return this.habitLogRepository.getAverageDifficulty(
      habitId,
      defaultStartDate,
      defaultEndDate
    );
  }
}
