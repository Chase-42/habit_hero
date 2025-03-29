import { z } from "zod";
import {
  completionSummarySchema,
  streakSummarySchema,
  HabitLogSchema,
} from "~/entities/models/habit-log";

import {
  type Habit,
  type HabitFilters,
  HabitSchema,
  habitFiltersSchema,
} from "~/entities/models/habit";

import {
  type HabitLog,
  type CompletionSummary,
  type StreakSummary,
} from "~/entities/models/habit-log";

// API Response Types
export type HabitResponse = Omit<Habit, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export type HabitLogResponse = Omit<HabitLog, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export type HabitFiltersResponse = HabitFilters;

export type CompletionSummaryResponse = CompletionSummary;

export type StreakSummaryResponse = StreakSummary;

// API Request Types
export type CreateHabitRequest = Omit<
  Habit,
  "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
>;

export type UpdateHabitRequest = Partial<
  Omit<Habit, "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak">
>;

export type CreateHabitLogRequest = Omit<
  HabitLog,
  "id" | "createdAt" | "updatedAt"
>;

// API Zod Schemas
export const apiHabitResponseSchema = HabitSchema.omit({
  createdAt: true,
  updatedAt: true,
}).extend({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const apiHabitLogResponseSchema = HabitLogSchema.omit({
  createdAt: true,
  updatedAt: true,
}).extend({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const apiHabitFiltersResponseSchema = habitFiltersSchema;

export const apiCompletionSummaryResponseSchema = completionSummarySchema;

export const apiStreakSummaryResponseSchema = streakSummarySchema;

export const apiCreateHabitRequestSchema = HabitSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  streak: true,
  longestStreak: true,
}).extend({
  reminderEnabled: z.boolean().default(false),
});

export const apiUpdateHabitRequestSchema =
  apiCreateHabitRequestSchema.partial();

export const apiCreateHabitLogRequestSchema = HabitLogSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type inference from schemas
export type ApiHabitResponse = z.infer<typeof apiHabitResponseSchema>;
export type ApiHabitLogResponse = z.infer<typeof apiHabitLogResponseSchema>;
export type ApiHabitFiltersResponse = z.infer<
  typeof apiHabitFiltersResponseSchema
>;
export type ApiCompletionSummaryResponse = z.infer<
  typeof apiCompletionSummaryResponseSchema
>;
export type ApiStreakSummaryResponse = z.infer<
  typeof apiStreakSummaryResponseSchema
>;
export type ApiCreateHabitRequest = z.infer<typeof apiCreateHabitRequestSchema>;
export type ApiUpdateHabitRequest = z.infer<typeof apiUpdateHabitRequestSchema>;
export type ApiCreateHabitLogRequest = z.infer<
  typeof apiCreateHabitLogRequestSchema
>;
