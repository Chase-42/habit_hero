import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getHabitById, updateHabit, deleteHabit } from "~/server/queries";
import type { Habit } from "~/types";
import type { RouteContext, RouteParams } from "~/types/route";
import { updateHabitSchema } from "~/schemas";

export async function GET(
  request: Request,
  context: RouteContext<Promise<RouteParams>>
): Promise<NextResponse<Habit | { error: string }>> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const habit = await getHabitById(id);
    if (!habit || habit.userId !== userId) {
      return NextResponse.json(
        { error: "Habit not found or unauthorized" },
        { status: 404 }
      );
    }
    return NextResponse.json(habit);
  } catch (error) {
    console.error("Error fetching habit:", error);
    return NextResponse.json(
      { error: "Failed to fetch habit" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext<Promise<RouteParams>>
): Promise<NextResponse<Habit | { error: string }>> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const habit = await getHabitById(id);
    if (!habit || habit.userId !== userId) {
      return NextResponse.json(
        { error: "Habit not found or unauthorized" },
        { status: 404 }
      );
    }

    const input = updateHabitSchema.parse(await request.json());
    await updateHabit(id, input);
    const updatedHabit = await getHabitById(id);
    if (!updatedHabit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }
    return NextResponse.json(updatedHabit);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error updating habit:", error);
    return NextResponse.json(
      { error: "Failed to update habit" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext<Promise<RouteParams>>
): Promise<NextResponse<{ success: true } | { error: string }>> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const habit = await getHabitById(id);
    if (!habit || habit.userId !== userId) {
      return NextResponse.json(
        { error: "Habit not found or unauthorized" },
        { status: 404 }
      );
    }

    await deleteHabit(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting habit:", error);
    return NextResponse.json(
      { error: "Failed to delete habit" },
      { status: 500 }
    );
  }
}
