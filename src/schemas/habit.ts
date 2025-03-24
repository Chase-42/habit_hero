import { z } from "zod";
import type {
  Habit,
  HabitColor,
  FrequencyType,
  HabitCategory,
} from "~/types/habit";

export const habitColorSchema = z.enum([
  "red",
  "green",
  "blue",
  "yellow",
  "purple",
  "pink",
  "orange",
] as const satisfies readonly HabitColor[]);

export const frequencyTypeSchema = z.enum([
  "daily",
  "weekly",
  "monthly",
] as const satisfies readonly FrequencyType[]);

export const habitCategorySchema = z.enum([
  "fitness",
  "nutrition",
  "mindfulness",
  "productivity",
  "other",
] as const satisfies readonly HabitCategory[]);

export const frequencyValueSchema = z.object({
  days: z.array(z.number()).optional(),
  times: z.number().optional(),
});

export const habitInputSchema = z.object({
  name: z.string(),
  userId: z.string(),
  color: habitColorSchema,
  frequencyType: frequencyTypeSchema,
  frequencyValue: frequencyValueSchema,
  category: habitCategorySchema,
  isActive: z.literal(true),
  isArchived: z.literal(false),
  description: z.string().nullable(),
  subCategory: z.string().nullable(),
  goal: z.number().nullable(),
  metricType: z.string().nullable(),
  units: z.string().nullable(),
  notes: z.string().nullable(),
  reminder: z.coerce.date().nullable(),
  reminderEnabled: z.boolean().nullable(),
  lastCompleted: z.coerce.date().nullable(),
}) satisfies z.ZodType<
  Omit<Habit, "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak">
>;

export const updateHabitSchema = z.object({
  name: z.string().optional(),
  color: habitColorSchema.optional(),
  frequencyType: frequencyTypeSchema.optional(),
  frequencyValue: frequencyValueSchema.optional(),
  category: habitCategorySchema.optional(),
  isActive: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  description: z.string().nullable().optional(),
  subCategory: z.string().nullable().optional(),
  goal: z.number().nullable().optional(),
  metricType: z.string().nullable().optional(),
  units: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  reminder: z.coerce.date().nullable().optional(),
  reminderEnabled: z.boolean().nullable().optional(),
}) satisfies z.ZodType<
  Partial<
    Omit<
      Habit,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "streak"
      | "longestStreak"
      | "lastCompleted"
      | "userId"
    >
  >
>;
