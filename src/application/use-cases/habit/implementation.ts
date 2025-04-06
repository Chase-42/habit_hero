import { inject, injectable } from "tsyringe";
import type { IHabitRepository } from "~/domain/repositories/habit-repository";
import type { IHabitLogRepository } from "~/domain/repositories/habit-log-repository";
import type { IHabitUseCase } from "./interface";
import { Habit } from "~/domain/entities/habit";
import { HabitLog } from "~/domain/entities/habit-log";
import { TYPES } from "@di/tokens";
import { ValidationError } from "~/domain/errors/validation-error";
import type { HabitCategory, HabitColor, FrequencyType } from "~/domain/enums";
import type { FrequencyValue } from "~/domain/utils/frequency";
import { DatabaseError } from "~/domain/errors/database-error";
import { logger } from "~/infrastructure/logger";

@injectable()
export class HabitUseCase implements IHabitUseCase {
  constructor(
    @inject(TYPES.HabitRepository)
    private readonly habitRepository: IHabitRepository,
    @inject(TYPES.HabitLogRepository)
    private readonly habitLogRepository: IHabitLogRepository
  ) {}

  async createHabit(params: {
    userId: string;
    name: string;
    description?: string;
    category: HabitCategory;
    color: HabitColor;
    frequencyType: FrequencyType;
    frequencyValue: FrequencyValue;
    subCategory?: string;
    goal?: number;
    metricType?: string;
    units?: string;
    notes?: string;
    reminder?: Date;
    reminderEnabled?: boolean;
  }): Promise<Habit> {
    try {
      logger.info("Creating new habit", {
        userId: params.userId,
        name: params.name,
      });
      const habit = Habit.create(params);
      const createdHabit = await this.habitRepository.create(habit);
      logger.info("Successfully created habit", { habitId: createdHabit.id });
      return createdHabit;
    } catch (error) {
      logger.error("Failed to create habit", { error, params });
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError("Failed to create habit");
    }
  }

  async updateHabit(params: {
    id: string;
    userId: string;
    name?: string;
    description?: string;
    category?: HabitCategory;
    color?: HabitColor;
    frequencyType?: FrequencyType;
    frequencyValue?: FrequencyValue;
    subCategory?: string;
    goal?: number;
    metricType?: string;
    units?: string;
    notes?: string;
    reminder?: Date;
    reminderEnabled?: boolean;
    isActive?: boolean;
    isArchived?: boolean;
  }): Promise<Habit> {
    try {
      logger.info("Updating habit", {
        habitId: params.id,
        userId: params.userId,
      });
      const existingHabit = await this.habitRepository.findById(params.id);
      if (!existingHabit) {
        throw new ValidationError("Habit not found");
      }

      if (existingHabit.userId !== params.userId) {
        throw new ValidationError("Unauthorized");
      }

      const updatedHabit = existingHabit.update(params);
      const result = await this.habitRepository.update(updatedHabit);
      logger.info("Successfully updated habit", { habitId: result.id });
      return result;
    } catch (error) {
      logger.error("Failed to update habit", { error, params });
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError("Failed to update habit");
    }
  }

  async deleteHabit(id: string, userId: string): Promise<void> {
    try {
      logger.info("Deleting habit", { habitId: id, userId });
      const habit = await this.habitRepository.findById(id);
      if (!habit) {
        throw new ValidationError("Habit not found");
      }

      if (habit.userId !== userId) {
        throw new ValidationError("Unauthorized");
      }

      await this.habitRepository.delete(id);
      logger.info("Successfully deleted habit", { habitId: id });
    } catch (error) {
      logger.error("Failed to delete habit", { error, habitId: id, userId });
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError("Failed to delete habit");
    }
  }

  async getHabit(id: string, userId: string): Promise<Habit> {
    try {
      logger.info("Getting habit", { habitId: id, userId });
      const habit = await this.habitRepository.findById(id);
      if (!habit) {
        throw new ValidationError("Habit not found");
      }

      if (habit.userId !== userId) {
        throw new ValidationError("Unauthorized");
      }

      return habit;
    } catch (error) {
      logger.error("Failed to get habit", { error, habitId: id, userId });
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError("Failed to get habit");
    }
  }

  async getHabits(userId: string): Promise<Habit[]> {
    try {
      logger.info("Getting habits for user", { userId });
      const habits = await this.habitRepository.findByUserId(userId);
      logger.info("Successfully retrieved habits", {
        count: habits.length,
        userId,
      });
      return habits;
    } catch (error) {
      logger.error("Failed to get habits", { error, userId });
      throw new DatabaseError("Failed to get habits");
    }
  }

  async completeHabit(params: {
    habitId: string;
    userId: string;
    value?: number;
    notes?: string;
    details?: Record<string, unknown>;
    difficulty?: number;
    feeling?: string;
    hasPhoto?: boolean;
    photoUrl?: string;
  }): Promise<HabitLog> {
    try {
      logger.info("Completing habit", {
        habitId: params.habitId,
        userId: params.userId,
      });

      // Use transaction to ensure both habit update and log creation succeed or fail together
      const result = await this.habitRepository.withTransaction(async () => {
        const habit = await this.habitRepository.findById(params.habitId);
        if (!habit) {
          throw new ValidationError("Habit not found");
        }

        if (habit.userId !== params.userId) {
          throw new ValidationError("Unauthorized");
        }

        const log = HabitLog.create({
          habitId: params.habitId,
          userId: params.userId,
          value: params.value,
          notes: params.notes,
          details: params.details,
          difficulty: params.difficulty,
          feeling: params.feeling,
          hasPhoto: params.hasPhoto,
          photoUrl: params.photoUrl,
        });

        const completedHabit = habit.complete();
        await this.habitRepository.update(completedHabit);
        const createdLog = await this.habitLogRepository.create(log);

        return createdLog;
      });

      logger.info("Successfully completed habit", {
        habitId: params.habitId,
        logId: result.id,
      });

      return result;
    } catch (error) {
      logger.error("Failed to complete habit", { error, params });
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError("Failed to complete habit");
    }
  }

  async getHabitLogs(params: {
    habitId: string;
    userId: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<HabitLog[]> {
    try {
      logger.info("Getting habit logs", {
        habitId: params.habitId,
        userId: params.userId,
        startDate: params.startDate,
        endDate: params.endDate,
      });

      const habit = await this.habitRepository.findById(params.habitId);
      if (!habit) {
        throw new ValidationError("Habit not found");
      }

      if (habit.userId !== params.userId) {
        throw new ValidationError("Unauthorized");
      }

      let logs: HabitLog[];
      if (params.startDate && params.endDate) {
        logs = await this.habitLogRepository.findByDateRange({
          habitId: params.habitId,
          startDate: params.startDate,
          endDate: params.endDate,
        });
      } else {
        logs = await this.habitLogRepository.findByHabitId(params.habitId);
      }

      logger.info("Successfully retrieved habit logs", {
        count: logs.length,
        habitId: params.habitId,
      });

      return logs;
    } catch (error) {
      logger.error("Failed to get habit logs", { error, params });
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError("Failed to get habit logs");
    }
  }
}
