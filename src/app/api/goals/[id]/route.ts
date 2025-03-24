import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { goals } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { updateGoalSchema } from "~/schemas";
import type { Goal, RelatedHabits } from "~/types";
import type { RouteContext, RouteParams } from "~/types/route";

export async function GET(
  request: Request,
  context: RouteContext<Promise<RouteParams>>
): Promise<NextResponse<Goal | { error: string }>> {
  try {
    const { id } = await context.params;
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    // Convert null values to undefined to match Goal type
    const typedGoal: Goal = {
      ...goal,
      description: goal.description ?? undefined,
      targetDate: goal.targetDate ?? undefined,
      isCompleted: goal.isCompleted ?? undefined,
      category: goal.category ?? undefined,
      metricType: goal.metricType ?? undefined,
      startValue: goal.startValue ?? undefined,
      currentValue: goal.currentValue ?? undefined,
      targetValue: goal.targetValue ?? undefined,
      units: goal.units ?? undefined,
      relatedHabits: (goal.relatedHabits as RelatedHabits[]) ?? undefined,
      createdAt: goal.createdAt ?? undefined,
      updatedAt: goal.updatedAt ?? undefined,
    };

    return NextResponse.json(typedGoal);
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

    const [goal] = await db.select().from(goals).where(eq(goals.id, id));

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const updatedGoal: Goal = {
      ...goal,
      ...updates,
      description: updates.description ?? undefined,
      targetDate: updates.targetDate ?? undefined,
      isCompleted: updates.isCompleted ?? undefined,
      category: updates.category ?? undefined,
      metricType: updates.metricType ?? undefined,
      startValue: updates.startValue ?? undefined,
      currentValue: updates.currentValue ?? undefined,
      targetValue: updates.targetValue ?? undefined,
      units: updates.units ?? undefined,
      relatedHabits: (updates.relatedHabits as RelatedHabits[]) ?? undefined,
      createdAt: goal.createdAt ?? undefined,
      updatedAt: new Date(),
    };

    await db.update(goals).set(updatedGoal).where(eq(goals.id, id));

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

    // Check if goal exists and belongs to user
    const [goal] = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)));

    if (!goal) {
      return NextResponse.json(
        { error: "Goal not found or unauthorized" },
        { status: 404 }
      );
    }

    await db.delete(goals).where(eq(goals.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 }
    );
  }
}
