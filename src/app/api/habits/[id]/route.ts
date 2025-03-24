import { NextResponse } from "next/server";
import { getHabitById, updateHabit, deleteHabit } from "~/server/queries";
import type { Habit } from "~/types";
import type { RouteContext, RouteParams } from "~/types/route";
import { updateHabitSchema } from "~/schemas";

export async function GET(
  request: Request,
  context: RouteContext<Promise<RouteParams>>
): Promise<NextResponse<Habit | { error: string }>> {
  try {
    const { id } = await context.params;
    const habit = await getHabitById(id);
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
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
  try {
    const { id } = await context.params;
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
