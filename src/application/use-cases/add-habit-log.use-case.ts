import { injectable, inject } from "tsyringe";
import type { Result } from "~/application/types";
import type { HabitLog, CreateHabitLog } from "~/entities/models/habit-log";
import { ValidationError, NotFoundError } from "~/entities/errors";
import type { IHabitRepository } from "~/application/interfaces/repositories/habit-repository.interface";
import type { IHabitLogRepository } from "~/application/interfaces/repositories/habit-log-repository.interface";

@injectable()
export class AddHabitLogUseCase {
  constructor(
    @inject("IHabitRepository")
    private readonly habitRepository: IHabitRepository,
    @inject("IHabitLogRepository")
    private readonly habitLogRepository: IHabitLogRepository
  ) {}

  async execute(
    habitId: string,
    userId: string,
    data: Omit<CreateHabitLog, "habitId" | "userId">
  ): Promise<Result<HabitLog, ValidationError | NotFoundError>> {
    // Validate input
    if (!habitId || !userId) {
      return {
        ok: false,
        error: new ValidationError("Habit ID and User ID are required"),
      };
    }

    // Check if habit exists
    const habitResult = await this.habitRepository.findById(habitId);
    if (!habitResult.ok) {
      return {
        ok: false,
        error: habitResult.error,
      };
    }

    // Create log
    const logData: CreateHabitLog = {
      ...data,
      habitId,
      userId,
    };

    return this.habitLogRepository.create(logData);
  }
}
