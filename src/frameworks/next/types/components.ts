import type { Habit, HabitLog } from "~/entities/models";
import type { ThemeProviderProps } from "next-themes";
import type { ReactNode } from "react";

export interface Stats {
  totalHabits: number;
  completedToday: number;
  currentStreak: number;
  completionRate: number;
}

export interface StatsCardsProps {
  habits: Habit[];
  habitLogs: HabitLog[];
}

export interface ThemeProps extends ThemeProviderProps {
  children: ReactNode;
}

export interface FormItemContextValue {
  id: string;
}

export interface FormFieldContextValue<
  TFieldValues extends Record<string, unknown> = Record<string, unknown>,
> {
  name: string;
}
