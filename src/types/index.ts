import { z } from "zod";
import type {
  DB_GoalType,
  DB_HabitType,
  DB_HabitLogType,
} from "~/infrastructure/database/schema";

// Domain Enums
export const HabitCategory = {
  FITNESS: "fitness",
  NUTRITION: "nutrition",
  MINDFULNESS: "mindfulness",
  PRODUCTIVITY: "productivity",
  OTHER: "other",
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

export const FrequencyType = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  SPECIFIC_DAYS: "specific_days",
} as const;

// Domain Types
export type HabitCategoryEnum =
  (typeof HabitCategory)[keyof typeof HabitCategory];
export type HabitColorEnum = (typeof HabitColor)[keyof typeof HabitColor];
export type HabitIconEnum = (typeof HabitIcon)[keyof typeof HabitIcon];
export type HabitDifficultyEnum =
  (typeof HabitDifficulty)[keyof typeof HabitDifficulty];
export type HabitFeelingEnum = (typeof HabitFeeling)[keyof typeof HabitFeeling];
export type FrequencyTypeEnum =
  (typeof FrequencyType)[keyof typeof FrequencyType];

// Zod Schemas
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

// Domain Models
export const GoalSchema = z.object({
  id: z.number().int().positive(),
  userId: z.string(),
  title: z.string().min(1),
  description: z.string().default(""),
  notes: z.string().default(""),
  isCompleted: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const HabitSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().min(1),
  description: z.string().default(""),
  category: HabitCategorySchema.default(HabitCategory.OTHER),
  color: HabitColorSchema.default(HabitColor.BLUE),
  icon: HabitIconSchema.default(HabitIcon.DEFAULT),
  frequencyType: FrequencyTypeSchema,
  frequencyValue: z.record(z.unknown()),
  streak: z.number().int().min(0).default(0),
  longestStreak: z.number().int().min(0).default(0),
  isCompleted: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isArchived: z.boolean().default(false),
  lastCompleted: z.date().nullable(),
  notes: z.string().default(""),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const HabitLogSchema = z.object({
  id: z.string(),
  habitId: z.string(),
  userId: z.string(),
  value: z.string().default(""),
  notes: z.string().default(""),
  details: z.record(z.unknown()).default({}),
  difficulty: HabitDifficultySchema.default(HabitDifficulty.NORMAL),
  feeling: HabitFeelingSchema.default(HabitFeeling.NEUTRAL),
  hasPhoto: z.boolean().default(false),
  completedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create/Update Schemas
export const CreateGoalSchema = GoalSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateGoalSchema = CreateGoalSchema.partial();

export const CreateHabitSchema = HabitSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateHabitSchema = CreateHabitSchema.partial();

export const CreateHabitLogSchema = HabitLogSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateHabitLogSchema = CreateHabitLogSchema.partial();

// Type exports
export type Goal = z.infer<typeof GoalSchema>;
export type Habit = z.infer<typeof HabitSchema>;
export type HabitLog = z.infer<typeof HabitLogSchema>;

export type CreateGoal = z.infer<typeof CreateGoalSchema>;
export type UpdateGoal = z.infer<typeof UpdateGoalSchema>;

export type CreateHabit = z.infer<typeof CreateHabitSchema>;
export type UpdateHabit = z.infer<typeof UpdateHabitSchema>;

export type CreateHabitLog = z.infer<typeof CreateHabitLogSchema>;
export type UpdateHabitLog = z.infer<typeof UpdateHabitLogSchema>;
