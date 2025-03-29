import { injectable, inject } from "tsyringe";
import type { Result } from "~/application/types";
import type { NotFoundError, ValidationError } from "~/entities/errors";
import type { GetGoalsUseCase } from "~/application/use-cases/goals/get-goals";
import type { CreateGoalUseCase } from "~/application/use-cases/goals/create-goal";
import type { UpdateGoalUseCase } from "~/application/use-cases/goals/update-goal";
import type { GetGoalUseCase } from "~/application/use-cases/goals/get-goal";
import type { DeleteGoalUseCase } from "~/application/use-cases/goals/delete-goal";
import type { Goal } from "~/entities/models/goal";
import type { NewGoal } from "~/entities/types/form";

export interface GoalController {
  getGoals(userId: string): Promise<Result<Goal[], NotFoundError>>;
  getGoal(id: string): Promise<Result<Goal, NotFoundError>>;
  createGoal(goal: NewGoal): Promise<Result<Goal, ValidationError>>;
  updateGoal(
    id: string,
    goal: Partial<Goal>
  ): Promise<Result<Goal, ValidationError | NotFoundError>>;
  delete(id: string): Promise<Result<void, NotFoundError>>;
}

@injectable()
export class GoalControllerImpl implements GoalController {
  constructor(
    @inject("GetGoalsUseCase")
    private readonly getGoalsUseCase: GetGoalsUseCase,
    @inject("CreateGoalUseCase")
    private readonly createGoalUseCase: CreateGoalUseCase,
    @inject("UpdateGoalUseCase")
    private readonly updateGoalUseCase: UpdateGoalUseCase,
    @inject("GetGoalUseCase")
    private readonly getGoalUseCase: GetGoalUseCase,
    @inject("DeleteGoalUseCase")
    private readonly deleteGoalUseCase: DeleteGoalUseCase
  ) {}

  async getGoals(userId: string): Promise<Result<Goal[], NotFoundError>> {
    return this.getGoalsUseCase.execute(userId);
  }

  async getGoal(id: string): Promise<Result<Goal, NotFoundError>> {
    return this.getGoalUseCase.execute(id);
  }

  async createGoal(goal: NewGoal): Promise<Result<Goal, ValidationError>> {
    return this.createGoalUseCase.execute(goal);
  }

  async updateGoal(
    id: string,
    goal: Partial<Goal>
  ): Promise<Result<Goal, ValidationError | NotFoundError>> {
    return this.updateGoalUseCase.execute(id, goal);
  }

  async delete(id: string): Promise<Result<void, NotFoundError>> {
    return this.deleteGoalUseCase.execute(id);
  }
}
