import { z } from "zod";
import type { HabitLog } from "~/types/models/log";

export const habitLogInputSchema = z.object({
  habitId: z.string(),
  userId: z.string(),
  completedAt: z.coerce.date(),
  value: z.number().nullable(),
  notes: z.string().nullable(),
  details: z.record(z.any()).nullable(),
  difficulty: z.number().nullable(),
  feeling: z.string().nullable(),
  hasPhoto: z.boolean(),
  photoUrl: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}) satisfies z.ZodType<Omit<HabitLog, "id">>;

export const toggleHabitSchema = z.object({
  userId: z.string(),
});
