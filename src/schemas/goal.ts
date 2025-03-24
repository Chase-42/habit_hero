import { z } from "zod";
import type { Goal } from "~/types/goal";

export const relatedHabitsSchema = z.object({
  habitIds: z.array(z.string()),
  relationship: z.enum(["supports", "conflicts", "prerequisite"]),
  notes: z.string().optional(),
});

export const goalInputSchema = z.object({
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  notes: z.string().optional(),
  isCompleted: z.boolean(),
}) satisfies z.ZodType<Omit<Goal, "id" | "createdAt" | "updatedAt">>;

export const updateGoalSchema = goalInputSchema.partial().extend({
  userId: z.string(),
});
