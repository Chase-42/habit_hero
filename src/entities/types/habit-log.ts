import { z } from "zod";

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

export const CreateHabitLogSchema = HabitLogSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateHabitLog = z.infer<typeof CreateHabitLogSchema>;

export const UpdateHabitLogSchema = CreateHabitLogSchema.partial();

export type UpdateHabitLog = z.infer<typeof UpdateHabitLogSchema>;

// Additional types for analytics
export type CompletionSummary = {
  date: Date;
  count: number;
  details: HabitLog[];
};

export type StreakSummary = {
  date: Date;
  streak: number;
  wasStreakBroken: boolean;
};
