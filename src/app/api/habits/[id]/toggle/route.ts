import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { habits, habitLogs } from "~/server/db/schema";
import { and, between, eq } from "drizzle-orm";

const toggleInput = z.object({
  completed: z.boolean(),
  userId: z.string(),
});

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PUT(
  request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const input = toggleInput.parse(await request.json());
    const habitId = context.params.id;

    // First check if the habit exists and belongs to the user
    const [habit] = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, habitId), eq(habits.userId, input.userId)));

    if (!habit) {
      return NextResponse.json(
        { error: "Habit not found or unauthorized" },
        { status: 404 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if there's already a log for today
    const [existingLog] = await db
      .select()
      .from(habitLogs)
      .where(
        and(
          eq(habitLogs.habitId, habitId),
          between(habitLogs.completedAt, today, tomorrow)
        )
      );

    if (input.completed && !existingLog) {
      // Create a new log
      await db.insert(habitLogs).values({
        id: crypto.randomUUID(),
        habitId,
        userId: input.userId,
        completedAt: new Date(),
        value: null,
        notes: null,
        details: null,
        difficulty: null,
        feeling: null,
        hasPhoto: false,
        photoUrl: null,
      });

      // Update streak
      const streak = habit.streak + 1;
      const longestStreak = Math.max(habit.longestStreak, streak);

      await db
        .update(habits)
        .set({
          streak,
          longestStreak,
          lastCompleted: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(habits.id, habitId));
    } else if (!input.completed && existingLog) {
      // Remove the log
      await db.delete(habitLogs).where(eq(habitLogs.id, existingLog.id));

      // Update streak
      const streak = Math.max(0, habit.streak - 1);
      await db
        .update(habits)
        .set({
          streak,
          updatedAt: new Date(),
        })
        .where(eq(habits.id, habitId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error toggling habit:", error);
    return NextResponse.json(
      { error: "Failed to toggle habit" },
      { status: 500 }
    );
  }
}
