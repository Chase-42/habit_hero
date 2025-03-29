import { z } from "zod";
import {
  FrequencyTypeSchema,
  FrequencyValueSchema,
  HabitCategorySchema,
  HabitColorSchema,
} from "~/entities/models/habit";

export const NewHabitFormSchema = z.object({
  userId: z.string(),
  name: z.string().min(1),
  description: z.string().nullable(),
  category: HabitCategorySchema,
  color: HabitColorSchema,
  frequencyType: FrequencyTypeSchema,
  frequencyValue: z.discriminatedUnion("type", [
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
  ]),
  notes: z.string().nullable(),
});

export type NewHabitForm = z.infer<typeof NewHabitFormSchema>;

export const NewGoalSchema = z.object({
  userId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().nullable(),
  notes: z.string().nullable(),
  isCompleted: z.boolean().default(false),
});

export type NewGoal = z.infer<typeof NewGoalSchema>;
