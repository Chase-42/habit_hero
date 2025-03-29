import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { habits, habitLogs } from "~/server/db/schema";
import { and, between, eq } from "drizzle-orm";
import { toggleHabitSchema } from "~/schemas";
import type { RouteContext, RouteParams } from "~/types/route";
import type { ApiResponse } from "~/types/api/validation";

type ToggleResponse = NextResponse<
  ApiResponse<{ success: true }> | ApiResponse<null>
>;

export async function PUT(
  request: Request,
  context: RouteContext<Promise<RouteParams>>
): Promise<ToggleResponse> {
  try {
    const { id } = await context.params;
    const input = toggleHabitSchema.parse(await request.json());

    // Get the habit
    const [habit] = await db.select().from(habits).where(eq(habits.id, id));

    if (!habit) {
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "Habit not found",
          },
        },
        { status: 404 }
      );
    }

    // Check if the habit belongs to the user
    if (habit.userId !== input.userId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Unauthorized to toggle this habit",
          },
        },
        { status: 403 }
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    // Check if there's already a log for today
    const [existingLog] = await db
      .select()
      .from(habitLogs)
      .where(
        and(
          eq(habitLogs.habitId, id),
          between(habitLogs.completedAt, today, tomorrow)
        )
      );

    if (input.completed) {
      // If marking as completed and no log exists, create one
      if (!existingLog) {
        await db.insert(habitLogs).values({
          id: crypto.randomUUID(),
          habitId: id,
          userId: input.userId,
          completedAt: now,
          value: null,
          notes: null,
          details: null,
          difficulty: null,
          feeling: null,
          hasPhoto: false,
          photoUrl: null,
        });

        // Update habit's streak and last completed
        await db
          .update(habits)
          .set({
            lastCompleted: now,
            streak: habit.streak + 1,
            longestStreak: Math.max(habit.longestStreak, habit.streak + 1),
            updatedAt: now,
          })
          .where(eq(habits.id, id));
      }
    } else {
      // If marking as uncompleted and a log exists, delete it
      if (existingLog) {
        await db.delete(habitLogs).where(eq(habitLogs.id, existingLog.id));

        // Update habit's streak and last completed
        await db
          .update(habits)
          .set({
            lastCompleted: null,
            streak: Math.max(0, habit.streak - 1),
            updatedAt: now,
          })
          .where(eq(habits.id, id));
      }
    }

    return NextResponse.json<ApiResponse<{ success: true }>>({
      data: { success: true },
    });
  } catch (error) {
    console.error("Error toggling habit:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: {
          code: "TOGGLE_ERROR",
          message: "Failed to toggle habit",
          details:
            error instanceof Error
              ? [{ field: "general", message: error.message }]
              : undefined,
        },
      },
      { status: 500 }
    );
  }
}
