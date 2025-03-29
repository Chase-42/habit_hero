import { injectable, inject } from "tsyringe";
import type { Result } from "~/application/types";
import type { NotFoundError } from "~/entities/errors";
import type { IGoalRepository } from "~/application/interfaces/repositories/goal-repository";
import type { Goal } from "~/entities/models/goal";

export interface GetGoalsUseCase {
  execute(userId: string): Promise<Result<Goal[], NotFoundError>>;
}

@injectable()
export class GetGoalsUseCaseImpl implements GetGoalsUseCase {
  constructor(
    @inject("IGoalRepository")
    private readonly goalRepository: IGoalRepository
  ) {}

  async execute(userId: string): Promise<Result<Goal[], NotFoundError>> {
    return this.goalRepository.findByUserId(userId);
  }
}
