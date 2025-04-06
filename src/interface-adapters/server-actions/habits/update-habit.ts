import "reflect-metadata";
import { container } from "tsyringe";
import { HabitUseCase } from "~/infrastructure/use-cases/habit/implementation";
import { z } from "zod";
import type { Habit } from "~/domain/entities/habit";
import type { HabitCategory, HabitColor, FrequencyType } from "~/domain/enums";
import type { FrequencyValue } from "~/domain/utils/frequency";

const UpdateHabitRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(3).max(50),
  description: z.string().optional(),
  category: z.string(),
  color: z.string(),
  frequencyType: z.string(),
  frequencyValue: z.object({
    days: z.array(z.number().min(0).max(6)).optional(),
    times: z.number().min(1).optional(),
  }),
  subCategory: z.string().optional(),
  goal: z.number().optional(),
  metricType: z.string().optional(),
  units: z.string().optional(),
  notes: z.string().optional(),
  reminder: z.date().optional(),
  reminderEnabled: z.boolean().optional(),
});

export type UpdateHabitRequest = z.infer<typeof UpdateHabitRequestSchema>;

export async function updateHabit(input: UpdateHabitRequest): Promise<Habit> {
  // Validate input using Zod schema
  const validatedInput = UpdateHabitRequestSchema.parse(input);

  // Get the use case from the container
  const habitUseCase = container.resolve(HabitUseCase);

  // Execute the use case
  const habit = await habitUseCase.updateHabit({
    id: validatedInput.id,
    userId: validatedInput.userId,
    name: validatedInput.name,
    description: validatedInput.description ?? null,
    category: validatedInput.category as HabitCategory,
    color: validatedInput.color as HabitColor,
    frequencyType: validatedInput.frequencyType as FrequencyType,
    frequencyValue: validatedInput.frequencyValue as FrequencyValue,
    subCategory: validatedInput.subCategory ?? null,
    goal: validatedInput.goal ?? null,
    metricType: validatedInput.metricType ?? null,
    units: validatedInput.units ?? null,
    notes: validatedInput.notes ?? null,
    reminder: validatedInput.reminder ?? null,
    reminderEnabled: validatedInput.reminderEnabled ?? false,
  });

  return habit;
}
