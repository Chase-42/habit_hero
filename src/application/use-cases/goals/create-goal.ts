import { injectable } from "tsyringe";
import { type IGoalRepository } from "~/application/interfaces/repositories/goal-repository";
import { type Goal } from "~/entities/models/goal";
import { type NewGoal } from "~/entities/types/form";
import { type Result } from "~/application/types";
import { ValidationError } from "~/entities/errors";

export interface CreateGoalUseCase {
  execute(goal: NewGoal): Promise<Result<Goal, ValidationError>>;
}

@injectable()
export class CreateGoalUseCaseImpl implements CreateGoalUseCase {
  constructor(private readonly goalRepository: IGoalRepository) {}

  async execute(goal: NewGoal): Promise<Result<Goal, ValidationError>> {
    try {
      const result = await this.goalRepository.create(goal);
      if (!result.ok) {
        return result;
      }
      return { ok: true, value: result.value };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { ok: false, error };
      }
      throw error;
    }
  }
}
