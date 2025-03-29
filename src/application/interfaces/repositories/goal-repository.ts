import type { Goal } from "~/entities/models/goal";
import type { NewGoal } from "~/entities/types/form";
import type { NotFoundError, ValidationError } from "~/entities/errors";
import type { Result } from "~/application/types";

export interface IGoalRepository {
  findById(id: string): Promise<Result<Goal, NotFoundError>>;
  findByUserId(userId: string): Promise<Result<Goal[], NotFoundError>>;
  create(data: NewGoal): Promise<Result<Goal, ValidationError>>;
  update(
    id: string,
    data: Partial<Goal>
  ): Promise<Result<Goal, ValidationError | NotFoundError>>;
  delete(id: string): Promise<Result<void, NotFoundError>>;
  validate(goal: Partial<Goal>): Promise<Result<true, ValidationError>>;
  exists(id: string): Promise<boolean>;
  isOwnedBy(id: string, userId: string): Promise<boolean>;
  findAll(userId: string): Promise<Result<Goal[], NotFoundError>>;
}
