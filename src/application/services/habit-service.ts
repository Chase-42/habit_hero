import { injectable } from "tsyringe";
import type { IHabitUseCase } from "~/application/use-cases/habit/interface";
import type { Habit } from "~/domain/entities/habit";
import type { HabitLog } from "~/domain/entities/habit-log";
import type { HabitCategory, HabitColor, FrequencyType } from "~/domain/enums";
import type { FrequencyValue } from "~/domain/utils/frequency";

@injectable()
export class HabitService {
  constructor(private readonly habitUseCase: IHabitUseCase) {}

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
      return await this.habitUseCase.createHabit(params);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create habit: ${error.message}`);
      }
      throw new Error("Failed to create habit: Unknown error");
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
      return await this.habitUseCase.updateHabit(params);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update habit: ${error.message}`);
      }
      throw new Error("Failed to update habit: Unknown error");
    }
  }

  async deleteHabit(id: string, userId: string): Promise<void> {
    try {
      await this.habitUseCase.deleteHabit(id, userId);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete habit: ${error.message}`);
      }
      throw new Error("Failed to delete habit: Unknown error");
    }
  }

  async getHabit(id: string, userId: string): Promise<Habit> {
    try {
      return await this.habitUseCase.getHabit(id, userId);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get habit: ${error.message}`);
      }
      throw new Error("Failed to get habit: Unknown error");
    }
  }

  async getHabits(userId: string): Promise<Habit[]> {
    try {
      return await this.habitUseCase.getHabits(userId);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get habits: ${error.message}`);
      }
      throw new Error("Failed to get habits: Unknown error");
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
      return await this.habitUseCase.completeHabit(params);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to complete habit: ${error.message}`);
      }
      throw new Error("Failed to complete habit: Unknown error");
    }
  }

  async getHabitLogs(params: {
    habitId: string;
    userId: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<HabitLog[]> {
    try {
      return await this.habitUseCase.getHabitLogs(params);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get habit logs: ${error.message}`);
      }
      throw new Error("Failed to get habit logs: Unknown error");
    }
  }
}
