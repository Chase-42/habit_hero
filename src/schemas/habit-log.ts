import { z } from "zod";
import type { HabitLog } from "~/types/habit-log";

export const habitLogInputSchema = z.object({
  habitId: z.string(),
  userId: z.string(),
  completedAt: z.coerce.date(),
  value: z.number().nullable(),
  notes: z.string().nullable(),
  details: z.record(z.unknown()).nullable(),
  difficulty: z.number().min(1).max(5).nullable(),
  feeling: z.string().nullable(),
  hasPhoto: z.boolean(),
  photoUrl: z.string().nullable(),
}) satisfies z.ZodType<Omit<HabitLog, "id">>;

export const toggleHabitSchema = z.object({
  completed: z.boolean(),
  userId: z.string(),
});
