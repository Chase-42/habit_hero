import { injectable, inject } from "tsyringe";
import type { IHabitRepository } from "../../interfaces/habit-repository";
import type { Habit } from "../../../entities/models/habit";
import type { ValidationError } from "../../errors";
import type { Result } from "../../types";
import { err, ok } from "../../types";

@injectable()
export class CreateHabitUseCase {
  constructor(
    @inject("IHabitRepository")
    private readonly habitRepository: IHabitRepository
  ) {}

  async execute(
    habit: Omit<
      Habit,
      "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
    >
  ): Promise<Result<Habit, ValidationError>> {
    // Validate the habit
    const validationResult = await this.habitRepository.validate(habit);
    if (!validationResult.ok) {
      return err(validationResult.error);
    }

    // Create the habit
    const result = await this.habitRepository.create(habit);
    if (!result.ok) {
      return err(result.error);
    }

    return ok(result.value);
  }
}
