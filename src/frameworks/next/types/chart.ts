import type { Habit, HabitLog, HabitCategory } from "~/entities/models";

export interface DayCompletion {
  date: Date;
  percentage: number;
  completed: number;
  total: number;
}

export interface CategoryData {
  name: HabitCategory;
  value: number;
  label: string;
  color: string;
}

export interface ChartConfigItem {
  min: number;
  max: number;
  color: string;
}

export type ChartConfig = Record<string, ChartConfigItem>;

export interface StreakHeatmapProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  days?: number;
}

export interface HeatmapDayProps {
  day: DayCompletion;
}

export interface HeatmapLegendProps {
  weeks: number;
}

export interface HabitCategoryChartProps {
  habits: Habit[];
}
