import type {
  HabitCategory,
  HabitColor,
  FrequencyType,
} from "../../../../entities/models/habit";

// UI-specific types for form elements and display
export interface CategoryOption {
  label: string;
  value: HabitCategory;
}

export interface FrequencyOption {
  label: string;
  value: FrequencyType;
}

export interface DayOption {
  label: string;
  value: number;
}

export interface ColorOption {
  label: string;
  value: HabitColor;
  class: string;
}

// Constants for UI usage
export const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

export const DAY_OPTIONS: DayOption[] = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

export const COLOR_OPTIONS: ColorOption[] = [
  { label: "Red", value: "red", class: "bg-red-500" },
  { label: "Green", value: "green", class: "bg-green-500" },
  { label: "Blue", value: "blue", class: "bg-blue-500" },
  { label: "Yellow", value: "yellow", class: "bg-yellow-500" },
  { label: "Purple", value: "purple", class: "bg-purple-500" },
  { label: "Pink", value: "pink", class: "bg-pink-500" },
  { label: "Orange", value: "orange", class: "bg-orange-500" },
];

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { label: "Fitness", value: "fitness" },
  { label: "Nutrition", value: "nutrition" },
  { label: "Mindfulness", value: "mindfulness" },
  { label: "Productivity", value: "productivity" },
  { label: "Other", value: "other" },
];
