import type { Habit } from "~/types";
import {
  type HabitColor,
  type FrequencyType,
  type HabitCategory,
} from "./common/enums";

export type NewHabit = Omit<
  Habit,
  "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
>;

export type Category = {
  label: string;
  value: HabitCategory;
};

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
