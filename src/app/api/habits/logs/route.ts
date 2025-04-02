import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { habits, habitLogs } from "~/server/db/schema";
import { eq, and, between } from "drizzle-orm";
import { habitLogInputSchema } from "~/schemas";
import type { ApiResponse } from "~/types/api/validation";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const habitId = searchParams.get("habitId");
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    if (!habitId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "habitId is required",
          },
        },
        { status: 400 }
      );
    }

    let logs;
    if (startDateStr && endDateStr) {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      // Create date-only versions for comparison
      const startCompare = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        0,
        0,
        0,
        0
      );
      const endCompare = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
        23,
        59,
        59,
        999
      );

      console.log(
        "[API] Fetching logs:",
        JSON.stringify(
          {
            habitId,
            startDate: startCompare.toISOString(),
            endDate: endCompare.toISOString(),
          },
          null,
          2
        )
      );

      logs = await db
        .select()
        .from(habitLogs)
        .where(
          and(
            eq(habitLogs.habitId, habitId),
            between(habitLogs.completedAt, startCompare, endCompare)
          )
        )
        .orderBy(habitLogs.completedAt);

      console.log(
        "[API] Found logs:",
        JSON.stringify(
          {
            count: logs.length,
            logs: logs.map((l) => ({
              id: l.id,
              completedAt: l.completedAt,
            })),
          },
          null,
          2
        )
      );
    } else {
      logs = await db
        .select()
        .from(habitLogs)
        .where(eq(habitLogs.habitId, habitId))
        .orderBy(habitLogs.completedAt);
    }

    return NextResponse.json<ApiResponse<typeof logs>>({ data: logs });
  } catch (error) {
    console.error("Error fetching habit logs:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: {
          code: "FETCH_ERROR",
          message: "Failed to fetch habit logs",
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const input = habitLogInputSchema.parse(body);

    // Check if habit exists
    const [habit] = await db
      .select()
      .from(habits)
      .where(eq(habits.id, input.habitId));

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

    // Check if user owns the habit
    if (habit.userId !== input.userId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Unauthorized access to habit",
          },
        },
        { status: 403 }
      );
    }

    // Create the log
    const completedAt = new Date(input.completedAt);
    const newLog = {
      id: crypto.randomUUID(),
      habitId: input.habitId,
      userId: input.userId,
      completedAt,
      value: input.value,
      notes: input.notes,
      details: input.details,
      difficulty: input.difficulty,
      feeling: input.feeling,
      hasPhoto: input.hasPhoto,
      photoUrl: input.photoUrl,
    };

    await db.insert(habitLogs).values(newLog);

    // Update habit streak
    const today = new Date(
      completedAt.getFullYear(),
      completedAt.getMonth(),
      completedAt.getDate(),
      0,
      0,
      0,
      0
    );
    const yesterday = new Date(
      completedAt.getFullYear(),
      completedAt.getMonth(),
      completedAt.getDate() - 1,
      0,
      0,
      0,
      0
    );

    const [yesterdayLog] = await db
      .select()
      .from(habitLogs)
      .where(
        and(
          eq(habitLogs.habitId, input.habitId),
          between(habitLogs.completedAt, yesterday, today)
        )
      );

    let streak = habit.streak;
    if (!yesterdayLog) {
      // Reset streak if no log yesterday
      streak = 1;
    } else {
      // Increment streak
      streak += 1;
    }

    // Update longest streak if needed
    const longestStreak = Math.max(streak, habit.longestStreak);

    await db
      .update(habits)
      .set({
        streak,
        longestStreak,
        lastCompleted: completedAt,
        updatedAt: completedAt,
      })
      .where(eq(habits.id, input.habitId));

    return NextResponse.json<ApiResponse<typeof newLog>>({ data: newLog });
  } catch (error) {
    console.error("Error in POST /api/habits/logs:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: {
          code: "CREATE_ERROR",
          message: "Failed to create habit log",
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
