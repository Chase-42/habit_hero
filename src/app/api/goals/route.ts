import "reflect-metadata";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { container } from "../../../infrastructure/container";
import { type GoalController } from "../../../interface-adapters/controllers/goal.controller";
import { z } from "zod";
import { withErrorHandler } from "../../../interface-adapters/middleware/error-handler.middleware";
import { withAuth } from "../../../interface-adapters/middleware/auth.middleware";
import { ValidationError, NotFoundError } from "../../../entities/errors";
import type { Goal } from "../../../entities/models/goal";
import type { NewGoal } from "~/entities/types/form";

const createGoalSchema = z.object({
  userId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().nullable(),
  notes: z.string().nullable(),
  isCompleted: z.boolean().default(false),
});

type CreateGoalRequest = z.infer<typeof createGoalSchema>;

const createGoalHandler = async (request: Request): Promise<Response> => {
  try {
    const body = (await request.json()) as unknown;
    const validatedData = createGoalSchema.parse(body) as NewGoal;

    const goalController = container.resolve<GoalController>("GoalController");
    const result = await goalController.createGoal(validatedData);

    if (!result.ok) {
      if (result.error instanceof ValidationError) {
        return NextResponse.json(
          { error: result.error.message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create goal" },
        { status: 500 }
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid goal data" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
};

const getGoalsHandler = async (request: Request): Promise<Response> => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const goalController = container.resolve<GoalController>("GoalController");
    const result = await goalController.getGoals(userId);

    if (!result.ok) {
      if (result.error instanceof NotFoundError) {
        return NextResponse.json(
          { error: result.error.message },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch goals" },
        { status: 500 }
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
};

export const POST = withErrorHandler(withAuth(createGoalHandler));
export const GET = withErrorHandler(withAuth(getGoalsHandler));
