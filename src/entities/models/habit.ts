import { z } from "zod";
import type { DB_HabitRow } from "~/infrastructure/database/types";

export type HabitDB = DB_HabitRow;

// Domain Constants (Enterprise Business Rules)
export const FrequencyType = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  SPECIFIC_DAYS: "specific_days",
} as const;

export const HabitColor = {
  RED: "red",
  GREEN: "green",
  BLUE: "blue",
  YELLOW: "yellow",
  PURPLE: "purple",
  PINK: "pink",
  ORANGE: "orange",
} as const;

export const HabitCategory = {
  FITNESS: "fitness",
  NUTRITION: "nutrition",
  MINDFULNESS: "mindfulness",
  PRODUCTIVITY: "productivity",
  OTHER: "other",
} as const;

export const HabitIcon = {
  DEFAULT: "default",
} as const;

export const HabitDifficulty = {
  EASY: "easy",
  NORMAL: "normal",
  HARD: "hard",
} as const;

export const HabitFeeling = {
  GREAT: "great",
  GOOD: "good",
  NEUTRAL: "neutral",
  BAD: "bad",
  TERRIBLE: "terrible",
} as const;

// Domain Types
export type FrequencyType = (typeof FrequencyType)[keyof typeof FrequencyType];
export type HabitColor = (typeof HabitColor)[keyof typeof HabitColor];
export type HabitCategory = (typeof HabitCategory)[keyof typeof HabitCategory];
export type HabitIcon = (typeof HabitIcon)[keyof typeof HabitIcon];

// Value Objects
export type FrequencyValue =
  | { type: "daily"; times: number }
  | { type: "weekly"; daysOfWeek: number[]; times: number }
  | { type: "monthly"; daysOfMonth: number[]; times: number }
  | { type: "specific_days"; days: Date[]; times: number };

export interface HabitDetails {
  duration?: number; // In minutes
  distance?: number; // In meters
  sets?: number; // Number of sets
  reps?: number; // Reps per set
  weight?: number; // In kg
  intensity?: number; // Scale 1-10
  customFields?: Record<string, string | number | boolean>;
}

// Base Types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserOwned {
  userId: string;
}

// Domain Models with Zod Validation (Enterprise Business Rules)
export const habitLogSchema = z.object({
  id: z.string().uuid(),
  habitId: z.string().uuid(),
  userId: z.string(),
  value: z.number().optional(),
  notes: z.string().optional(),
  details: z
    .object({
      duration: z.number().positive().optional(),
      distance: z.number().positive().optional(),
      sets: z.number().positive().optional(),
      reps: z.number().positive().optional(),
      weight: z.number().positive().optional(),
      intensity: z.number().min(1).max(10).optional(),
      customFields: z
        .record(z.union([z.string(), z.number(), z.boolean()]))
        .optional(),
    })
    .optional(),
  difficulty: z.number().min(1).max(10).optional(),
  feeling: z.string().optional(),
  hasPhoto: z.boolean(),
  completedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const HabitCategorySchema = z.enum([
  HabitCategory.FITNESS,
  HabitCategory.NUTRITION,
  HabitCategory.MINDFULNESS,
  HabitCategory.PRODUCTIVITY,
  HabitCategory.OTHER,
]);

export const HabitColorSchema = z.enum([
  HabitColor.RED,
  HabitColor.GREEN,
  HabitColor.BLUE,
  HabitColor.YELLOW,
  HabitColor.PURPLE,
  HabitColor.PINK,
  HabitColor.ORANGE,
]);

export const HabitIconSchema = z.enum([HabitIcon.DEFAULT]);

export const HabitDifficultySchema = z.enum([
  HabitDifficulty.EASY,
  HabitDifficulty.NORMAL,
  HabitDifficulty.HARD,
]);

export const HabitFeelingSchema = z.enum([
  HabitFeeling.GREAT,
  HabitFeeling.GOOD,
  HabitFeeling.NEUTRAL,
  HabitFeeling.BAD,
  HabitFeeling.TERRIBLE,
]);

export const FrequencyTypeSchema = z.enum([
  FrequencyType.DAILY,
  FrequencyType.WEEKLY,
  FrequencyType.MONTHLY,
  FrequencyType.SPECIFIC_DAYS,
]);

export const FrequencyValueSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("daily"),
    times: z.number().int().min(1),
  }),
  z.object({
    type: z.literal("weekly"),
    daysOfWeek: z.array(z.number().int().min(0).max(6)),
    times: z.number().int().min(1),
  }),
  z.object({
    type: z.literal("monthly"),
    daysOfMonth: z.array(z.number().int().min(1).max(31)),
    times: z.number().int().min(1),
  }),
  z.object({
    type: z.literal("specific_days"),
    days: z.array(z.date()),
    times: z.number().int().min(1),
  }),
]);

// Domain Model Schema
export const HabitSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  category: z.enum([
    "fitness",
    "nutrition",
    "mindfulness",
    "productivity",
    "other",
  ]),
  color: z.enum(["red", "green", "blue", "yellow", "purple", "pink", "orange"]),
  icon: z.string(),
  frequencyType: FrequencyTypeSchema,
  frequencyValue: FrequencyValueSchema,
  streak: z.number(),
  longestStreak: z.number(),
  isCompleted: z.boolean(),
  isActive: z.boolean(),
  isArchived: z.boolean(),
  lastCompleted: z.date().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  reminder: z.date().nullable(),
  reminderEnabled: z.boolean().default(false),
});

export type Habit = z.infer<typeof HabitSchema>;

// Create Habit Schema for API
export const CreateHabitSchema = HabitSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  streak: true,
  longestStreak: true,
});

export type CreateHabit = z.infer<typeof CreateHabitSchema>;

// Update Habit Schema for API
export const UpdateHabitSchema = CreateHabitSchema.partial();

export type UpdateHabit = z.infer<typeof UpdateHabitSchema>;

// Type transformations
export function transformToDBHabit(habit: Habit): DB_HabitRow {
  return {
    id: habit.id,
    userId: habit.userId,
    title: habit.title,
    description: habit.description,
    category: habit.category,
    color: habit.color,
    icon: habit.icon,
    frequencyType: habit.frequencyType,
    frequencyValue: serializeFrequencyValue(habit.frequencyValue),
    streak: habit.streak,
    longestStreak: habit.longestStreak,
    isCompleted: habit.isCompleted,
    isActive: habit.isActive,
    isArchived: habit.isArchived,
    lastCompleted: habit.lastCompleted,
    notes: habit.notes,
    createdAt: habit.createdAt,
    updatedAt: habit.updatedAt,
  };
}

export function transformFromDBHabit(dbHabit: DB_HabitRow): Habit {
  try {
    // Handle frequency value that might be a string or object
    const parsedValue =
      typeof dbHabit.frequencyValue === "string"
        ? (JSON.parse(dbHabit.frequencyValue) as unknown)
        : (dbHabit.frequencyValue as unknown);

    const result = FrequencyValueSchema.safeParse(parsedValue);
    if (!result.success) {
      throw new Error(
        `Invalid frequency value format: ${result.error.message}`
      );
    }
    const frequencyValue = result.data;

    const category = HabitCategorySchema.safeParse(dbHabit.category);
    const color = HabitColorSchema.safeParse(dbHabit.color);
    const frequencyType = FrequencyTypeSchema.safeParse(dbHabit.frequencyType);

    if (!category.success || !color.success || !frequencyType.success) {
      throw new Error("Invalid habit data format");
    }

    return {
      id: dbHabit.id,
      userId: dbHabit.userId,
      title: dbHabit.title,
      description: dbHabit.description,
      category: category.data,
      color: color.data,
      icon: dbHabit.icon,
      frequencyType: frequencyType.data,
      frequencyValue,
      streak: dbHabit.streak,
      longestStreak: dbHabit.longestStreak,
      isCompleted: dbHabit.isCompleted,
      isActive: dbHabit.isActive,
      isArchived: dbHabit.isArchived,
      lastCompleted: dbHabit.lastCompleted,
      notes: dbHabit.notes,
      createdAt: dbHabit.createdAt,
      updatedAt: dbHabit.updatedAt,
      reminder: null,
      reminderEnabled: false,
    };
  } catch (error) {
    console.error("Error transforming habit from DB:", error);
    throw new Error("Failed to transform habit from database");
  }
}

// Filters Schema
export const habitFiltersSchema = z.object({
  userId: z.string(),
  isActive: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  category: z
    .enum(["fitness", "nutrition", "mindfulness", "productivity", "other"])
    .optional(),
  searchQuery: z.string().optional(),
  sortBy: z.enum(["name", "createdAt", "category"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// Inferred Types from Schemas
export type HabitFilters = z.infer<typeof habitFiltersSchema>;

// Additional Domain Types
export interface CompletionSummary {
  date: Date;
  count: number;
  total: number;
}

export interface StreakSummary {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: Date;
}

// Database type for FrequencyValue
export type DB_FrequencyValue = string;

// Type transformations
export function serializeFrequencyValue(
  value: FrequencyValue
): DB_FrequencyValue {
  const result = FrequencyValueSchema.safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid frequency value: ${result.error.message}`);
  }
  return JSON.stringify(value);
}

export function deserializeFrequencyValue(
  value: DB_FrequencyValue
): FrequencyValue {
  try {
    const parsed = JSON.parse(value);
    const result = FrequencyValueSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error(
        `Invalid frequency value format: ${result.error.message}`
      );
    }
    return result.data;
  } catch (error) {
    throw new Error(
      `Failed to parse frequency value: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
