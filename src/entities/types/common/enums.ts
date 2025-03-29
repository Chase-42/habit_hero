export const FrequencyType = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
} as const;

export type FrequencyType = (typeof FrequencyType)[keyof typeof FrequencyType];

export const HabitColor = {
  RED: "red",
  GREEN: "green",
  BLUE: "blue",
  YELLOW: "yellow",
  PURPLE: "purple",
  PINK: "pink",
  ORANGE: "orange",
} as const;

export type HabitColor = (typeof HabitColor)[keyof typeof HabitColor];

export const HabitCategory = {
  FITNESS: "fitness",
  NUTRITION: "nutrition",
  MINDFULNESS: "mindfulness",
  PRODUCTIVITY: "productivity",
  OTHER: "other",
} as const;

export type HabitCategory = (typeof HabitCategory)[keyof typeof HabitCategory];
