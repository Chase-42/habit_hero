import type { HabitLog } from "./habit-log";

/**
 * Summary of habit completions for analytics
 */
export interface CompletionSummary {
  date: Date;
  count: number;
  details: HabitLog[];
}

/**
 * Summary of habit streaks for analytics
 */
export interface StreakSummary {
  startDate: Date;
  endDate: Date;
  length: number;
  isActive: boolean;
}
