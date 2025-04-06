import { z } from "zod";
import type { Habit } from "~/types/models";
import { HabitColor, FrequencyType, HabitCategory } from "~/types/common/enums";

export const habitColorSchema = z.enum([
  HabitColor.RED,
  HabitColor.ORANGE,
  HabitColor.YELLOW,
  HabitColor.GREEN,
  HabitColor.BLUE,
  HabitColor.INDIGO,
  HabitColor.VIOLET,
  HabitColor.PINK,
  HabitColor.ROSE,
  HabitColor.CYAN,
  HabitColor.SKY,
  HabitColor.AMBER,
  HabitColor.EMERALD,
  HabitColor.TEAL,
  HabitColor.LIME,
  HabitColor.FUCHSIA,
  HabitColor.PURPLE,
]) as z.ZodType<HabitColor>;

export const frequencyTypeSchema = z.enum([
  FrequencyType.DAILY,
  FrequencyType.WEEKLY,
  FrequencyType.MONTHLY,
  FrequencyType.CUSTOM,
]) as z.ZodType<FrequencyType>;

export const habitCategorySchema = z.enum([
  HabitCategory.HEALTH,
  HabitCategory.FITNESS,
  HabitCategory.MENTAL,
  HabitCategory.PRODUCTIVITY,
  HabitCategory.RELATIONSHIPS,
  HabitCategory.FINANCE,
  HabitCategory.EDUCATION,
  HabitCategory.CREATIVITY,
  HabitCategory.SPIRITUAL,
  HabitCategory.OTHER,
]) as z.ZodType<HabitCategory>;

export const frequencyValueSchema = z.object({
  days: z.array(z.number()).optional(),
  times: z.number().optional(),
});

export const habitDetailsSchema = z.object({
  duration: z.number().optional(),
  distance: z.number().optional(),
  sets: z.number().optional(),
  reps: z.number().optional(),
  weight: z.number().optional(),
  intensity: z.number().optional(),
  customFields: z
    .record(z.union([z.string(), z.number(), z.boolean()]))
    .optional(),
});

export const newHabitSchema = z.object({
  name: z.string(),
  color: habitColorSchema,
  frequencyType: frequencyTypeSchema,
  frequencyValue: frequencyValueSchema,
  category: habitCategorySchema,
  isActive: z.boolean(),
  isArchived: z.boolean(),
  description: z.string().nullable(),
  subCategory: z.string().nullable(),
  goal: z.number().nullable(),
  metricType: z.string().nullable(),
  units: z.string().nullable(),
  notes: z.string().nullable(),
  reminder: z.coerce.date().nullable(),
  reminderEnabled: z.boolean(),
}) satisfies z.ZodType<
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
  reminderEnabled: z.boolean().optional(),
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

export const completeHabitSchema = z.object({
  value: z.number().optional(),
  notes: z.string().optional(),
  details: z.record(z.unknown()).optional(),
  difficulty: z.number().min(1).max(5).optional(),
  feeling: z.string().optional(),
  hasPhoto: z.boolean().optional(),
  photoUrl: z.string().optional(),
});

export const habitIdSchema = z.string().uuid();

export const habitListQuerySchema = z.object({
  category: habitCategorySchema.optional(),
  isActive: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  sortBy: z.enum(["name", "createdAt", "category"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
