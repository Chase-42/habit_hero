import { z } from "zod";
import { HabitDifficultySchema, HabitFeelingSchema } from "./habit";
import type { DB_HabitLogType } from "~/infrastructure/database/schema";

// Core domain model for HabitLog
export const HabitLogSchema = z.object({
  id: z.string(),
  habitId: z.string(),
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

export type HabitLog = z.infer<typeof HabitLogSchema>;

// Input types for creating and updating logs
export const CreateHabitLogSchema = HabitLogSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateHabitLog = z.infer<typeof CreateHabitLogSchema>;

export const UpdateHabitLogSchema = CreateHabitLogSchema.partial();
export type UpdateHabitLog = z.infer<typeof UpdateHabitLogSchema>;

// Analytics types
export const completionSummarySchema = z.object({
  date: z.date(),
  count: z.number().nonnegative(),
  details: z.array(HabitLogSchema),
});

export const streakSummarySchema = z.object({
  date: z.date(),
  streak: z.number().nonnegative(),
  wasStreakBroken: z.boolean(),
});

export type CompletionSummary = z.infer<typeof completionSummarySchema>;
export type StreakSummary = z.infer<typeof streakSummarySchema>;

export type HabitLogDB = DB_HabitLogType;

export function transformFromDBHabitLog(dbLog: HabitLogDB): HabitLog {
  return {
    ...dbLog,
    value: dbLog.value ?? undefined,
    notes: dbLog.notes ?? undefined,
    details: dbLog.details ? JSON.parse(dbLog.details) : undefined,
    difficulty: dbLog.difficulty ?? undefined,
    feeling: dbLog.feeling ?? undefined,
    completedAt: new Date(dbLog.completedAt),
    createdAt: new Date(dbLog.createdAt),
    updatedAt: new Date(dbLog.updatedAt),
  };
}

export function transformToDBHabitLog(habitLog: HabitLog): HabitLogDB {
  return {
    ...habitLog,
    value: habitLog.value ?? null,
    notes: habitLog.notes ?? null,
    details: habitLog.details ? JSON.stringify(habitLog.details) : null,
    difficulty: habitLog.difficulty ?? null,
    feeling: habitLog.feeling ?? null,
    photoUrl: null,
    completedAt: habitLog.completedAt,
    createdAt: habitLog.createdAt,
    updatedAt: habitLog.updatedAt,
  };
}
