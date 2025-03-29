import type { Habit } from "~/entities/models/habit";
import type { HabitLog } from "~/entities/models/habit-log";
import type { IHabitLogRepository } from "~/application/interfaces/habit-log-repository";
import { injectable, inject } from "tsyringe";

export interface CompletionSummary {
  date: Date;
  count: number;
  details: HabitLog[];
}

export interface StreakSummary {
  date: Date;
  streak: number;
  wasStreakBroken: boolean;
}

@injectable()
export class HabitAnalytics {
  constructor(
    @inject("HabitLogRepository")
    private habitLogRepository: IHabitLogRepository
  ) {}

  async getCompletionHistory(
    habitId: string,
    groupBy: "day" | "week" | "month" = "day"
  ): Promise<CompletionSummary[]> {
    return this.habitLogRepository.getCompletionHistory(habitId, groupBy);
  }

  async getStreakHistory(
    habitId: string,
    startDate: Date | null = null,
    endDate: Date | null = null
  ): Promise<StreakSummary[]> {
    return this.habitLogRepository.getStreakHistory(
      habitId,
      startDate,
      endDate
    );
  }

  async getCompletionRate(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const logs = await this.habitLogRepository.findByDateRange(
      habitId,
      startDate,
      endDate
    );

    if (!logs || logs.length === 0) return 0;

    // For now, we'll assume daily habits
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return logs.length / totalDays;
  }

  async getAverageDifficulty(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const logs = await this.habitLogRepository.findByDateRange(
      habitId,
      startDate,
      endDate
    );

    if (!logs || logs.length === 0) return 0;

    const totalDifficulty = logs.reduce(
      (sum, log) => sum + (log.difficulty ?? 0),
      0
    );
    return totalDifficulty / logs.length;
  }
}
