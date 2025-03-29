import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GoalApiController } from "~/interface-adapters/controllers/goal-api.controller";

const apiController = new GoalApiController();

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
): Promise<Response> {
  return apiController.updateGoal(req, context);
}

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
): Promise<Response> {
  return apiController.getGoal(req, context);
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
): Promise<Response> {
  return apiController.deleteGoal(req, context);
}
