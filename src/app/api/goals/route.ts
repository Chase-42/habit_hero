import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { goals } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { goalInputSchema } from "~/schemas";
import type { Goal, RelatedHabits } from "~/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const dbGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(goals.createdAt);

    // Convert null values to undefined to match Goal type
    const typedGoals: Goal[] = dbGoals.map((goal) => ({
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
    }));

    return NextResponse.json(typedGoals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const input = goalInputSchema.parse(await request.json());
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(goals).values(newGoal);
    return NextResponse.json(newGoal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating goal:", error);
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}
