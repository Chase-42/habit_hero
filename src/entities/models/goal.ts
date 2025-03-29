import { z } from "zod";

export const relatedHabitsSchema = z.object({
  habitIds: z.array(z.string().uuid()),
  relationship: z.enum(["supports", "conflicts", "prerequisite"]),
  notes: z.string().nullable(),
});

export const GoalSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  title: z.string().min(1),
  description: z.string().nullable(),
  notes: z.string().nullable(),
  isCompleted: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Goal = z.infer<typeof GoalSchema>;

export const CreateGoalSchema = GoalSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateGoal = z.infer<typeof CreateGoalSchema>;

export const UpdateGoalSchema = CreateGoalSchema.partial();
export type UpdateGoal = z.infer<typeof UpdateGoalSchema>;

export type RelatedHabits = z.infer<typeof relatedHabitsSchema>;
