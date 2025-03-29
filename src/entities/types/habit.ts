import { z } from "zod";

export const HabitSchema = z.object({
  id: z.number(),
  userId: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  color: z.string(),
  icon: z.string(),
  frequencyType: z.string(),
  frequencyValue: z.string(), // Stored as stringified JSON in SingleStore
  streak: z.number(),
  longestStreak: z.number(),
  isCompleted: z.number(), // Using number for SingleStore compatibility
  isActive: z.number(), // Using number for SingleStore compatibility
  isArchived: z.number(), // Using number for SingleStore compatibility
  lastCompleted: z.date().nullable(),
  notes: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Habit = z.infer<typeof HabitSchema>;

export const CreateHabitSchema = HabitSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateHabit = z.infer<typeof CreateHabitSchema>;

export const UpdateHabitSchema = CreateHabitSchema.partial();

export type UpdateHabit = z.infer<typeof UpdateHabitSchema>;
