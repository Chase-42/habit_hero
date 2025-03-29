import { injectable } from "tsyringe";
import { type IGoalRepository } from "~/application/interfaces/repositories/goal-repository";
import { type Goal } from "~/entities/models/goal";
import { type Result } from "~/application/types";
import { NotFoundError } from "~/entities/errors";

export interface GetGoalUseCase {
  execute(id: string): Promise<Result<Goal, NotFoundError>>;
}

@injectable()
export class GetGoalUseCaseImpl implements GetGoalUseCase {
  constructor(private readonly goalRepository: IGoalRepository) {}

  async execute(id: string): Promise<Result<Goal, NotFoundError>> {
    try {
      const result = await this.goalRepository.findById(id);
      if (!result.ok) {
        return result;
      }
      return { ok: true, value: result.value };
    } catch (error) {
      if (error instanceof NotFoundError) {
        return { ok: false, error };
      }
      throw error;
    }
  }
}
