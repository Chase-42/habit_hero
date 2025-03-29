import { injectable } from "tsyringe";
import { type IGoalRepository } from "~/application/interfaces/repositories/goal-repository";
import { type Goal } from "~/entities/models/goal";
import { type Result } from "~/application/types";
import { ValidationError, NotFoundError } from "~/entities/errors";

export interface UpdateGoalUseCase {
  execute(
    id: string,
    goal: Partial<Goal>
  ): Promise<Result<Goal, ValidationError | NotFoundError>>;
}

@injectable()
export class UpdateGoalUseCaseImpl implements UpdateGoalUseCase {
  constructor(private readonly goalRepository: IGoalRepository) {}

  async execute(
    id: string,
    goal: Partial<Goal>
  ): Promise<Result<Goal, ValidationError | NotFoundError>> {
    try {
      const result = await this.goalRepository.update(id, goal);
      if (!result.ok) {
        return result;
      }
      return { ok: true, value: result.value };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        return { ok: false, error };
      }
      throw error;
    }
  }
}
