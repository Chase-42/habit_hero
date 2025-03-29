import type { HabitColor, FrequencyType, HabitCategory } from "./common/enums";

export type FrequencyValue = {
  days?: number[]; // 0-6 for weekly (0 = Sunday)
  times?: number; // X times per period
};

export type HabitDetails = {
  duration?: number; // in minutes
  distance?: number; // in specified units
  sets?: number;
  reps?: number;
  weight?: number; // in specified units
  intensity?: number; // 1-10 scale
  customFields?: Record<string, string | number | boolean>;
};

export type { HabitColor, FrequencyType, HabitCategory };
