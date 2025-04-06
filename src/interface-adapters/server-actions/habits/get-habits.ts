import "reflect-metadata";
import { container } from "tsyringe";
import { HabitUseCase } from "~/infrastructure/use-cases/habit/implementation";
import { z } from "zod";
import type { Habit } from "~/domain/entities/habit";

const GetHabitsRequestSchema = z.object({
  userId: z.string(),
});

export type GetHabitsRequest = z.infer<typeof GetHabitsRequestSchema>;

export async function getHabits(input: GetHabitsRequest): Promise<Habit[]> {
  // Validate input using Zod schema
  const validatedInput = GetHabitsRequestSchema.parse(input);

  // Get the use case from the container
  const habitUseCase = container.resolve(HabitUseCase);

  // Execute the use case
  const habits = await habitUseCase.getHabits(validatedInput.userId);

  return habits;
}
