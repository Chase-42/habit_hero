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
  targetDate: z.coerce.date().optional(),
  isCompleted: z.boolean().optional(),
  category: z.string().optional(),
  metricType: z.string().optional(),
  startValue: z.number().optional(),
  currentValue: z.number().optional(),
  targetValue: z.number().optional(),
  units: z.string().optional(),
  relatedHabits: z.array(relatedHabitsSchema).optional(),
}) satisfies z.ZodType<Omit<Goal, "id" | "createdAt" | "updatedAt">>;

export const updateGoalSchema = goalInputSchema.partial().extend({
  userId: z.string(),
});
