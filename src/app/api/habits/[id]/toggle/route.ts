import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { habits, habitLogs } from "~/server/db/schema";
import { and, between, eq } from "drizzle-orm";
import { toggleHabitSchema } from "~/schemas";
import type { RouteContext, RouteParams } from "~/types/route";
import type { ApiResponse } from "~/types/api/validation";
import type { Habit } from "~/types";

type ToggleResponse = NextResponse<ApiResponse<Habit> | ApiResponse<null>>;

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

    console.log(
      "[API] Toggle state:\n" +
        JSON.stringify(
          {
            habitId: id,
            existingLog: existingLog
              ? {
                  id: existingLog.id,
                  completedAt: existingLog.completedAt,
                }
              : null,
            today,
            tomorrow,
          },
          null,
          2
        )
    );

    // If there's a log, delete it. If there isn't, create one.
    if (existingLog) {
      console.log(
        "[API] Uncompleting habit:\n" +
          JSON.stringify(
            {
              habitId: id,
              logId: existingLog.id,
            },
            null,
            2
          )
      );
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
    } else {
      console.log(
        "[API] Completing habit:\n" +
          JSON.stringify(
            {
              habitId: id,
              timestamp: now,
            },
            null,
            2
          )
      );
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

    // Get the updated habit
    const [updatedHabit] = await db
      .select()
      .from(habits)
      .where(eq(habits.id, id));

    if (!updatedHabit) {
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "Updated habit not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<Habit>>({
      data: updatedHabit,
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
