import { injectable } from "tsyringe";
import { type IGoalRepository } from "~/application/interfaces/repositories/goal-repository";
import { type Result } from "~/application/types";
import { NotFoundError } from "~/entities/errors";

export interface DeleteGoalUseCase {
  execute(id: string): Promise<Result<void, NotFoundError>>;
}

@injectable()
export class DeleteGoalUseCaseImpl implements DeleteGoalUseCase {
  constructor(private readonly goalRepository: IGoalRepository) {}

  async execute(id: string): Promise<Result<void, NotFoundError>> {
    try {
      const result = await this.goalRepository.delete(id);
      if (!result.ok) {
        return result;
      }
      return { ok: true, value: undefined };
    } catch (error) {
      if (error instanceof NotFoundError) {
        return { ok: false, error };
      }
      throw error;
    }
  }
}
