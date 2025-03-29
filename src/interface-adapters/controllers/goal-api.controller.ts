import type { NextRequest } from "next/server";
import { container } from "~/infrastructure/container";
import type { GoalController } from "./goal.controller";
import { GoalPresenter } from "../presenters/goal.presenter";
import { GoalValidator } from "../validators/goal.validator";
import { AuthMiddleware } from "../middleware/auth.middleware";
import type { Goal } from "~/entities/models/goal";

export class GoalApiController {
  private readonly goalController: GoalController;

  constructor() {
    this.goalController = container.resolve<GoalController>("GoalController");
  }

  async updateGoal(
    req: NextRequest,
    context: { params: { id: string } }
  ): Promise<Response> {
    const authError = await AuthMiddleware.validate(req);
    if (authError) return authError;

    try {
      const body = (await req.json()) as unknown as Partial<Goal>;
      const validationResult = GoalValidator.validateUpdateInput(body);

      if (!validationResult.success) {
        return GoalPresenter.toErrorResponse({
          name: "ValidationError",
          message: "Invalid goal data",
        });
      }

      const result = await this.goalController.updateGoal(
        context.params.id,
        validationResult.data
      );

      if (!result.ok) {
        return GoalPresenter.toErrorResponse(result.error);
      }

      return GoalPresenter.toResponse(result.value);
    } catch (error) {
      console.error(
        "Error updating goal:",
        error instanceof Error ? error.message : error
      );
      return GoalPresenter.toErrorResponse({
        name: "ValidationError",
        message: "Failed to update goal",
      });
    }
  }

  async getGoal(
    req: NextRequest,
    context: { params: { id: string } }
  ): Promise<Response> {
    const authError = await AuthMiddleware.validate(req);
    if (authError) return authError;

    try {
      const result = await this.goalController.getGoal(context.params.id);

      if (!result.ok) {
        return GoalPresenter.toErrorResponse(result.error);
      }

      return GoalPresenter.toResponse(result.value);
    } catch (error) {
      console.error(
        "Error fetching goal:",
        error instanceof Error ? error.message : error
      );
      return GoalPresenter.toErrorResponse({
        name: "ValidationError",
        message: "Failed to fetch goal",
      });
    }
  }

  async deleteGoal(
    req: NextRequest,
    context: { params: { id: string } }
  ): Promise<Response> {
    const authError = await AuthMiddleware.validate(req);
    if (authError) return authError;

    try {
      const result = await this.goalController.delete(context.params.id);

      if (!result.ok) {
        return GoalPresenter.toErrorResponse(result.error);
      }

      return GoalPresenter.toDeleteResponse();
    } catch (error) {
      console.error(
        "Error deleting goal:",
        error instanceof Error ? error.message : error
      );
      return GoalPresenter.toErrorResponse({
        name: "ValidationError",
        message: "Failed to delete goal",
      });
    }
  }
}
