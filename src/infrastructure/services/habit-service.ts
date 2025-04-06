import type { Habit } from "~/domain/entities/habit";
import type { HabitLog } from "~/domain/entities/habit-log";
import type {
  ApiResponse,
  ApiHabitLog,
  ApiHabit,
} from "~/interface-adapters/types/api";
import type { CreateHabitInput } from "~/domain/types/habit";
import {
  convertApiHabitLogToHabitLog,
  convertApiHabitToHabit,
} from "~/infrastructure/utils/type-converters";

export class HabitService {
  constructor(private readonly baseUrl = "/api") {}

  async completeHabit(habitId: string, userId: string): Promise<HabitLog> {
    const response = await fetch(`${this.baseUrl}/habits/${habitId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const result = (await response.json()) as ApiResponse<ApiHabitLog>;

    if (result.error) {
      throw new Error(result.error);
    }

    return convertApiHabitLogToHabitLog(result.data);
  }

  async deleteHabit(habitId: string, userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/habits/${habitId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const result = (await response.json()) as ApiResponse<void>;

    if (result.error) {
      throw new Error(result.error);
    }
  }

  async createHabit(input: CreateHabitInput, userId: string): Promise<Habit> {
    const response = await fetch(`${this.baseUrl}/habits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, userId }),
    });

    const result = (await response.json()) as ApiResponse<ApiHabit>;

    if (result.error) {
      throw new Error(result.error);
    }

    return convertApiHabitToHabit(result.data);
  }
}
