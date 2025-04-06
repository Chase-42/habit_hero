import type { Habit, FrequencyValue } from "~/types";
import { HabitCategory, HabitColor, FrequencyType } from "~/types/common/enums";
import { z } from "zod";

// Request DTOs
export const CreateHabitRequestSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Name is required"),
  color: z.nativeEnum(HabitColor),
  frequencyType: z.nativeEnum(FrequencyType),
  frequencyValue: z.object({
    days: z.array(z.number().min(0).max(6)).optional(),
    times: z.number().min(1).optional(),
  }),
  category: z.nativeEnum(HabitCategory),
  description: z.string().nullable().optional(),
  subCategory: z.string().nullable().optional(),
  goal: z.number().nullable().optional(),
  metricType: z.string().nullable().optional(),
  units: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  reminder: z.date().nullable().optional(),
  reminderEnabled: z.boolean().optional(),
});

export type CreateHabitRequest = z.infer<typeof CreateHabitRequestSchema>;

export const UpdateHabitRequestSchema =
  CreateHabitRequestSchema.partial().extend({
    id: z.string(),
    isActive: z.boolean().optional(),
    isArchived: z.boolean().optional(),
  });

export type UpdateHabitRequest = z.infer<typeof UpdateHabitRequestSchema>;

// Response DTOs
export type HabitResponse = Habit;

export type HabitListResponse = {
  habits: Habit[];
  total: number;
  page: number;
  pageSize: number;
};

// Error Response
export type ErrorResponse = {
  error: string;
  code: string;
  details?: Record<string, unknown>;
};
