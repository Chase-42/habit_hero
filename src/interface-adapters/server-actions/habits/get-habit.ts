import "reflect-metadata";
import { container } from "tsyringe";
import { HabitUseCase } from "~/infrastructure/use-cases/habit/implementation";
import { z } from "zod";
import type { Habit } from "~/domain/entities/habit";

const GetHabitRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
});

export type GetHabitRequest = z.infer<typeof GetHabitRequestSchema>;

export async function getHabit(input: GetHabitRequest): Promise<Habit> {
  // Validate input using Zod schema
  const validatedInput = GetHabitRequestSchema.parse(input);

  // Get the use case from the container
  const habitUseCase = container.resolve(HabitUseCase);

  // Execute the use case
  const habit = await habitUseCase.getHabit(
    validatedInput.id,
    validatedInput.userId
  );

  return habit;
}
