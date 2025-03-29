import { injectable } from "tsyringe";
import type { Habit, HabitLog } from "../../entities/models";
import type { Result } from "../../application/types";
import { ValidationError, NotFoundError } from "../../entities/errors";
import type { IHabitApiClient } from "../../application/interfaces/habit-api.interface";

interface ApiErrorResponse {
  error: {
    message: string;
  };
}

@injectable()
export class HabitApiClient implements IHabitApiClient {
  async fetchHabits(userId: string): Promise<Result<Habit[], ValidationError>> {
    try {
      const response = await fetch(`/api/habits?userId=${userId}`);
      if (!response.ok) {
        const error = (await response.json()) as ApiErrorResponse;
        return {
          ok: false,
          error: new ValidationError(
            error.error.message || "Failed to load habits"
          ),
        };
      }
      const habits = (await response.json()) as Habit[];
      return { ok: true, value: habits };
    } catch (error) {
      return { ok: false, error: new ValidationError("Failed to load habits") };
    }
  }

  async createHabit(
    habit: Omit<
      Habit,
      "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
    >
  ): Promise<Result<Habit, ValidationError>> {
    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(habit),
      });

      if (!response.ok) {
        const error = (await response.json()) as ApiErrorResponse;
        return {
          ok: false,
          error: new ValidationError(
            error.error.message || "Failed to create habit"
          ),
        };
      }

      const newHabit = (await response.json()) as Habit;
      return { ok: true, value: newHabit };
    } catch (error) {
      return {
        ok: false,
        error: new ValidationError("Failed to create habit"),
      };
    }
  }

  async completeHabit(
    habit: Habit
  ): Promise<Result<void, ValidationError | NotFoundError>> {
    try {
      const logData = {
        habitId: habit.id,
        userId: habit.userId,
        completedAt: new Date(),
        value: null,
        notes: null,
        details: null,
        difficulty: null,
        feeling: null,
        hasPhoto: false,
        photoUrl: null,
      };

      const response = await fetch("/api/habits/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        const error = (await response.json()) as ApiErrorResponse;
        return {
          ok: false,
          error: new ValidationError(
            error.error.message || "Failed to complete habit"
          ),
        };
      }

      return { ok: true, value: undefined };
    } catch (error) {
      return {
        ok: false,
        error: new ValidationError("Failed to complete habit"),
      };
    }
  }

  async fetchHabitLogs(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<HabitLog[], ValidationError>> {
    try {
      const response = await fetch(
        `/api/habits/logs?habitId=${habitId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (!response.ok) {
        const error = (await response.json()) as ApiErrorResponse;
        return {
          ok: false,
          error: new ValidationError(
            error.error.message || "Failed to fetch habit logs"
          ),
        };
      }

      const logs = (await response.json()) as HabitLog[];
      return { ok: true, value: logs };
    } catch (error) {
      return {
        ok: false,
        error: new ValidationError("Failed to fetch habit logs"),
      };
    }
  }

  async fetchTodaysLogs(
    habitId: string
  ): Promise<Result<HabitLog[], ValidationError>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.fetchHabitLogs(habitId, today, tomorrow);
  }

  async deleteHabitLog(
    habitId: string,
    date: Date
  ): Promise<Result<void, ValidationError | NotFoundError>> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const logsResult = await this.fetchHabitLogs(
        habitId,
        startOfDay,
        endOfDay
      );
      if (!logsResult.ok) return logsResult;

      const logs = logsResult.value;
      if (logs.length === 0) return { ok: true, value: undefined };

      const log = logs[0];
      if (!log) return { ok: true, value: undefined };

      const response = await fetch(`/api/habits/logs/${log.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          ok: false,
          error: new ValidationError(
            error.error?.message || "Failed to uncomplete habit"
          ),
        };
      }

      return { ok: true, value: undefined };
    } catch (error) {
      return {
        ok: false,
        error: new ValidationError("Failed to uncomplete habit"),
      };
    }
  }

  async toggleHabit(
    habit: Habit,
    isCompleted: boolean
  ): Promise<Result<void, ValidationError | NotFoundError>> {
    try {
      const response = await fetch(`/api/habits/${habit.id}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed: isCompleted,
          userId: habit.userId,
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as ApiErrorResponse;
        return {
          ok: false,
          error: new ValidationError(
            error.error.message || "Failed to toggle habit"
          ),
        };
      }

      return { ok: true, value: undefined };
    } catch (error) {
      return {
        ok: false,
        error: new ValidationError("Failed to toggle habit"),
      };
    }
  }

  async deleteHabit(
    habitId: string,
    userId: string
  ): Promise<Result<void, ValidationError | NotFoundError>> {
    try {
      const response = await fetch(`/api/habits/${habitId}/delete`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = (await response.json()) as ApiErrorResponse;
        return {
          ok: false,
          error: new ValidationError(
            error.error.message || "Failed to delete habit"
          ),
        };
      }

      return { ok: true, value: undefined };
    } catch (error) {
      return {
        ok: false,
        error: new ValidationError("Failed to delete habit"),
      };
    }
  }
}
