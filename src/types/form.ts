import type { Habit, HabitColor, FrequencyType } from "~/types";

export type NewHabit = Omit<
  Habit,
  "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
>;

export type Frequency = {
  label: string;
  value: FrequencyType;
};

export type Day = {
  label: string;
  value: number;
};

export type Color = {
  label: string;
  value: HabitColor;
  class: string;
};
