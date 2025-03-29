import { injectable, inject } from "tsyringe";
import { type Result, ok, err } from "../../types";
import { ValidationError, NotFoundError } from "../../errors";
import type { IHabitRepository } from "../../interfaces/habit-repository";
import type { IHabitLogRepository } from "../../interfaces/habit-log-repository";
import type { Habit } from "../../../entities/models/habit";

export interface ToggleHabitUseCase {
  execute(
    habitId: string,
    userId: string,
    completed: boolean
  ): Promise<Result<Habit, ValidationError | NotFoundError>>;
}

@injectable()
export class ToggleHabitUseCaseImpl implements ToggleHabitUseCase {
  constructor(
    @inject("IHabitRepository")
    private readonly habitRepository: IHabitRepository,
    @inject("IHabitLogRepository")
    private readonly habitLogRepository: IHabitLogRepository
  ) {}

  async execute(
    habitId: string,
    userId: string,
    completed: boolean
  ): Promise<Result<Habit, ValidationError | NotFoundError>> {
    try {
      // First verify the habit exists and belongs to the user
      const habitResult = await this.habitRepository.findById(habitId);
      if (!habitResult.ok) {
        return habitResult;
      }

      const habit = habitResult.value;
      if (habit.userId !== userId) {
        return err(new ValidationError("Unauthorized to toggle this habit"));
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );

      // Check if there's already a log for today
      const existingLogsResult = await this.habitLogRepository.findByDateRange(
        habitId,
        today,
        tomorrow
      );

      if (!existingLogsResult.ok) {
        return err(existingLogsResult.error);
      }

      const existingLogs = existingLogsResult.value;

      if (completed) {
        // If marking as completed and no log exists, create one
        if (existingLogs.length === 0) {
          const logResult = await this.habitLogRepository.create({
            habitId,
            userId,
            completedAt: now,
            value: undefined,
            notes: undefined,
            details: undefined,
            difficulty: undefined,
            feeling: undefined,
            hasPhoto: false,
            createdAt: now,
            updatedAt: now,
          });

          if (!logResult.ok) {
            return err(logResult.error);
          }

          // Update habit's streak and last completed
          const updateResult = await this.habitRepository.update(habitId, {
            lastCompleted: now,
            streak: habit.streak + 1,
            longestStreak: Math.max(habit.longestStreak, habit.streak + 1),
            updatedAt: now,
          });

          if (!updateResult.ok) {
            return updateResult;
          }

          return ok(updateResult.value);
        }
      } else {
        // If marking as uncompleted and a log exists, delete it
        if (existingLogs.length > 0 && existingLogs[0]) {
          const deleteResult = await this.habitLogRepository.delete(
            existingLogs[0].id
          );

          if (!deleteResult.ok) {
            return err(deleteResult.error);
          }

          // Update habit's streak and last completed
          const updateResult = await this.habitRepository.update(habitId, {
            lastCompleted: null,
            streak: Math.max(0, habit.streak - 1),
            updatedAt: now,
          });

          if (!updateResult.ok) {
            return updateResult;
          }

          return ok(updateResult.value);
        }
      }

      return ok(habit);
    } catch (error) {
      console.error("Error in ToggleHabitUseCase:", error);
      return err(new ValidationError("Failed to toggle habit"));
    }
  }
}
