import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { habits, habitLogs } from "~/server/db/schema";
import { eq, and, between } from "drizzle-orm";
import { habitLogInputSchema } from "~/schemas";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const habitId = searchParams.get("habitId");
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    if (!habitId) {
      return NextResponse.json(
        { error: "habitId is required" },
        { status: 400 }
      );
    }

    if (startDateStr && endDateStr) {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      // Ensure start date is at beginning of day
      startDate.setHours(0, 0, 0, 0);

      // Ensure end date is at end of day
      endDate.setHours(23, 59, 59, 999);

      return NextResponse.json(
        await db
          .select()
          .from(habitLogs)
          .where(
            and(
              eq(habitLogs.habitId, habitId),
              between(habitLogs.completedAt, startDate, endDate)
            )
          )
          .orderBy(habitLogs.completedAt)
      );
    }

    return NextResponse.json(
      await db
        .select()
        .from(habitLogs)
        .where(eq(habitLogs.habitId, habitId))
        .orderBy(habitLogs.completedAt)
    );
  } catch (error) {
    console.error("Error fetching habit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch habit logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log("POST /api/habits/logs - Start");
    const body = (await request.json()) as unknown;
    console.log("Request body:", body);

    const input = habitLogInputSchema.parse(body);
    console.log("Validated input:", input);

    // Check if habit exists
    const [habit] = await db
      .select()
      .from(habits)
      .where(eq(habits.id, input.habitId));

    console.log("Found habit:", habit);

    if (!habit) {
      console.log("Habit not found:", input.habitId);
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Check if user owns the habit
    if (habit.userId !== input.userId) {
      console.log(
        "Unauthorized: habit.userId:",
        habit.userId,
        "input.userId:",
        input.userId
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
    console.log("Creating new log:", newLog);

    await db.insert(habitLogs).values(newLog);
    console.log("Log inserted successfully");

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
    console.log("Yesterday's log:", yesterdayLog);

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
    console.log("Updating streak:", { streak, longestStreak });

    await db
      .update(habits)
      .set({
        streak,
        longestStreak,
        lastCompleted: completedAt,
        updatedAt: completedAt,
      })
      .where(eq(habits.id, input.habitId));
    console.log("Habit streak updated");

    return NextResponse.json(newLog);
  } catch (error) {
    console.error("Error in POST /api/habits/logs:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating habit log:", error);
    return NextResponse.json(
      { error: "Failed to create habit log" },
      { status: 500 }
    );
  }
}
