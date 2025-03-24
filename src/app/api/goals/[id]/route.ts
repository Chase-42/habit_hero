import { NextResponse } from "next/server";
import { updateGoalSchema } from "~/schemas";
import type { Goal } from "~/types";
import type { RouteContext, RouteParams } from "~/types/route";
import {
  getGoalById,
  updateGoalById,
  deleteGoalById,
} from "~/server/queries/goals";

export async function GET(
  request: Request,
  context: RouteContext<Promise<RouteParams>>
): Promise<NextResponse<Goal | { error: string }>> {
  try {
    const { id } = await context.params;
    const goal = await getGoalById(id);

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error fetching goal:", error);
    return NextResponse.json(
      { error: "Failed to fetch goal" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext<Promise<RouteParams>>
): Promise<NextResponse<Goal | { error: string }>> {
  try {
    const { id } = await context.params;
    const updates = updateGoalSchema.parse(await request.json());

    const updatedGoal = await updateGoalById(id, updates);

    if (!updatedGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext<Promise<RouteParams>>
): Promise<NextResponse<{ success: true } | { error: string }>> {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const deleted = await deleteGoalById(id, userId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Goal not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 }
    );
  }
}
