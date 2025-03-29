import { injectable, inject } from "tsyringe";
import type { IHabitRepository } from "../interfaces/habit-repository";
import type { Habit } from "../../entities/models/habit";
import { ValidationError, RepositoryError } from "../../entities/errors";
import { type Result, ok, err } from "../types";

@injectable()
export class CreateHabitUseCase {
  constructor(
    @inject("IHabitRepository") private habitRepository: IHabitRepository
  ) {}

  async execute(
    input: Omit<
      Habit,
      "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
    >
  ): Promise<Result<Habit, ValidationError | RepositoryError>> {
    try {
      // Add missing fields with default values
      const habitData = {
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
        streak: 0,
        longestStreak: 0,
      };

      // Validate input
      const validationResult = await this.habitRepository.validate(habitData);
      if (!validationResult.ok) {
        return err(validationResult.error);
      }

      // Create habit
      const result = await this.habitRepository.create(habitData);
      if (!result.ok) {
        return err(result.error);
      }

      return ok(result.value);
    } catch (error) {
      return err(new RepositoryError("Failed to create habit"));
    }
  }
}
