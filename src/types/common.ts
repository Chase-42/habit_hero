export type HabitColor =
  | "red"
  | "green"
  | "blue"
  | "yellow"
  | "purple"
  | "pink"
  | "orange";

export type FrequencyType = "daily" | "weekly" | "monthly";

export type HabitCategory =
  | "fitness"
  | "nutrition"
  | "mindfulness"
  | "productivity"
  | "other";

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
