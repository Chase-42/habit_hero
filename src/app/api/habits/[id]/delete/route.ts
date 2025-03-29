import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { container } from "~/infrastructure/container";
import { type HabitController } from "~/interface-adapters/controllers/habit.controller";
import type { RouteContext, RouteParams } from "~/interface-adapters/types";
import type { NextRequest } from "next/server";

export async function DELETE(
  request: NextRequest,
  context: RouteContext<Promise<RouteParams>>
): Promise<NextResponse> {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const habitController =
      container.resolve<HabitController>("HabitController");
    await habitController.deleteHabit(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting habit:", error);
    return NextResponse.json(
      { error: "Failed to delete habit" },
      { status: 500 }
    );
  }
}
