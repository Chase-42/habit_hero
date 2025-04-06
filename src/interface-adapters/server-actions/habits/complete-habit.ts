import "reflect-metadata";
import { container } from "tsyringe";
import { z } from "zod";
import type { Habit } from "~/domain/entities/habit";
import type { IHabitRepository } from "~/domain/repositories/habit-repository";
import { DatabaseError } from "~/domain/errors/database-error";
import { logger } from "~/infrastructure/logger";

const CompleteHabitRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  notes: z.string().optional(),
});

export type CompleteHabitRequest = z.infer<typeof CompleteHabitRequestSchema>;

export async function completeHabit(
  input: CompleteHabitRequest
): Promise<Habit> {
  try {
    // Validate input using Zod schema
    const validatedInput = CompleteHabitRequestSchema.parse(input);

    // Get the repository from the container
    const habitRepository =
      container.resolve<IHabitRepository>("HabitRepository");

    // Mark the habit as completed
    await habitRepository.markAsCompleted({
      id: validatedInput.id,
      completedAt: new Date(),
      notes: validatedInput.notes,
    });

    // Get the updated habit
    const habit = await habitRepository.findById(validatedInput.id);
    if (!habit) {
      throw new DatabaseError("Habit not found");
    }

    return habit;
  } catch (error) {
    logger.error("Failed to complete habit", { error, input });
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError("Failed to complete habit");
  }
}
