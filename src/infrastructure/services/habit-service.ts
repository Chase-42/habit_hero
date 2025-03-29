import { injectable } from "tsyringe";
import type { IHabitService } from "~/application/interfaces/habit-service";
import type { IHttpClient } from "~/application/interfaces/http-client";
import type { Habit, HabitFilters, HabitLog } from "~/entities/models/habit";
import type { CompletionSummary, StreakSummary } from "~/entities/types/habit";
import type { Result } from "~/application/types";
import { ValidationError, NotFoundError } from "~/application/errors";

@injectable()
export class HabitService implements IHabitService {
  constructor(private readonly httpClient: IHttpClient) {}

  async fetchHabits(userId: string): Promise<Result<Habit[], NotFoundError>> {
    return this.httpClient.get<Habit[]>(`/api/habits?userId=${userId}`);
  }

  async fetchFilteredHabits(
    filters: HabitFilters
  ): Promise<Result<Habit[], NotFoundError>> {
    return this.httpClient.post<Habit[]>("/api/habits/filtered", filters);
  }

  async logHabit(
    log: Omit<HabitLog, "id">
  ): Promise<Result<HabitLog, ValidationError>> {
    return this.httpClient.post<HabitLog>("/api/habits/logs", log);
  }

  async fetchHabitLogs(
    habitId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Result<HabitLog[], NotFoundError>> {
    let url = `/api/habits/logs?habitId=${habitId}`;
    if (startDate) url += `&startDate=${startDate.toISOString()}`;
    if (endDate) url += `&endDate=${endDate.toISOString()}`;
    return this.httpClient.get<HabitLog[]>(url);
  }

  async fetchAnalytics(
    habitId: string,
    type: "completion" | "streak",
    options?: {
      groupBy?: "day" | "week" | "month";
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<Result<CompletionSummary[] | StreakSummary[], NotFoundError>> {
    let url = `/api/habits/analytics?type=${type}&habitId=${habitId}`;
    if (options?.groupBy) url += `&groupBy=${options.groupBy}`;
    if (options?.startDate)
      url += `&startDate=${options.startDate.toISOString()}`;
    if (options?.endDate) url += `&endDate=${options.endDate.toISOString()}`;
    return this.httpClient.get<CompletionSummary[] | StreakSummary[]>(url);
  }

  async updateHabit(
    habitId: string,
    updates: Partial<Omit<Habit, "id" | "createdAt">>
  ): Promise<Result<Habit, ValidationError | NotFoundError>> {
    return this.httpClient.put<Habit>(`/api/habits/${habitId}`, updates);
  }

  async deleteHabit(habitId: string): Promise<Result<void, NotFoundError>> {
    return this.httpClient.delete(`/api/habits/${habitId}`);
  }
}
