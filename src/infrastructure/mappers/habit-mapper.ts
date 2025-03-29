import type { Habit, HabitFilters } from "~/entities/models/habit";
import type {
  HabitLog,
  CompletionSummary,
  StreakSummary,
} from "~/entities/models/habit-log";
import type {
  ApiHabitResponse,
  ApiHabitLogResponse,
  ApiCompletionSummaryResponse,
  ApiStreakSummaryResponse,
} from "~/application/dtos/habit";

export class HabitMapper {
  toDomain(response: ApiHabitResponse): Habit {
    return {
      ...response,
      description: response.description ?? null,
      notes: response.notes ?? null,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
      reminder: response.reminder ? new Date(response.reminder) : null,
      reminderEnabled: response.reminderEnabled ?? false,
    };
  }

  toDomainLog(response: ApiHabitLogResponse): HabitLog {
    return {
      ...response,
      notes: response.notes ?? undefined,
      completedAt: new Date(response.completedAt),
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
    };
  }

  toDomainCompletion(
    response: ApiCompletionSummaryResponse
  ): CompletionSummary {
    return {
      ...response,
      date: new Date(response.date),
    };
  }

  toDomainStreak(response: ApiStreakSummaryResponse): StreakSummary {
    return {
      date: new Date(response.date),
      streak: response.streak,
      wasStreakBroken: response.wasStreakBroken,
    };
  }

  toDomainArray(responses: ApiHabitResponse[]): Habit[] {
    return responses.map(this.toDomain.bind(this));
  }

  toDomainLogArray(responses: ApiHabitLogResponse[]): HabitLog[] {
    return responses.map(this.toDomainLog.bind(this));
  }

  toDomainCompletionArray(
    responses: ApiCompletionSummaryResponse[]
  ): CompletionSummary[] {
    return responses.map(this.toDomainCompletion.bind(this));
  }

  toDomainStreakArray(responses: ApiStreakSummaryResponse[]): StreakSummary[] {
    return responses.map(this.toDomainStreak.bind(this));
  }
}
