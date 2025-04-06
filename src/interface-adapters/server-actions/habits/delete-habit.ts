import "reflect-metadata";
import { container } from "tsyringe";
import { HabitUseCase } from "~/infrastructure/use-cases/habit/implementation";
import { z } from "zod";

const DeleteHabitRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
});

export type DeleteHabitRequest = z.infer<typeof DeleteHabitRequestSchema>;

export async function deleteHabit(input: DeleteHabitRequest): Promise<void> {
  // Validate input using Zod schema
  const validatedInput = DeleteHabitRequestSchema.parse(input);

  // Get the use case from the container
  const habitUseCase = container.resolve(HabitUseCase);

  // Execute the use case
  await habitUseCase.deleteHabit(validatedInput.id, validatedInput.userId);
}
