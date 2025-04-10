"use server";

import { eq, and, between, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "~/server/db";
import { habits, habitLogs } from "~/server/db/schema";
import { revalidatePath } from "next/cache";
import { HabitCategory, FrequencyType, HabitColor } from "~/types/common/enums";

// Types
const habitSchema = z.object({
  name: z.string().min(1),
  userId: z.string(),
  category: z.nativeEnum(HabitCategory),
  frequencyType: z.nativeEnum(FrequencyType),
  frequencyValue: z.object({
    days: z.array(z.number()).optional(),
    times: z.number().optional(),
  }),
  color: z.nativeEnum(HabitColor),
  isActive: z.boolean(),
  isArchived: z.boolean(),
  description: z.string().nullable(),
  subCategory: z.string().nullable(),
  goal: z.number().nullable(),
  metricType: z.string().nullable(),
  units: z.string(),
  notes: z.string().nullable(),
  reminder: z.date().nullable(),
  reminderEnabled: z.boolean(),
});

class ServerError extends Error {
  constructor(
    public code:
      | "UNAUTHORIZED"
      | "NOT_FOUND"
      | "BAD_REQUEST"
      | "INTERNAL_SERVER_ERROR",
    message: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = "ServerError";
  }
}

export async function getHabits() {
  const { userId } = await auth();
  if (!userId) throw new ServerError("UNAUTHORIZED", "Unauthorized");

  try {
    const results = await db
      .select()
      .from(habits)
      .where(eq(habits.userId, userId))
      .orderBy(desc(habits.createdAt));

    return results;
  } catch (error) {
    console.error("Error fetching habits:", error);
    throw new ServerError(
      "INTERNAL_SERVER_ERROR",
      "Failed to fetch habits",
      error
    );
  }
}

export async function createHabit(data: z.infer<typeof habitSchema>) {
  const { userId } = await auth();
  if (!userId) throw new ServerError("UNAUTHORIZED", "Unauthorized");

  try {
    const validatedData = habitSchema.parse(data);

    await db.insert(habits).values({
      ...validatedData,
      userId,
      id: crypto.randomUUID(),
      streak: 0,
      longestStreak: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const [habit] = await db
      .select()
      .from(habits)
      .where(eq(habits.userId, userId))
      .orderBy(desc(habits.createdAt))
      .limit(1);

    revalidatePath("/");
    return habit;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ServerError("BAD_REQUEST", "Invalid habit data", error.errors);
    }
    console.error("Error creating habit:", error);
    throw new ServerError(
      "INTERNAL_SERVER_ERROR",
      "Failed to create habit",
      error
    );
  }
}

export async function toggleHabit(habitId: string, isCompleted: boolean) {
  const { userId } = await auth();
  if (!userId) throw new ServerError("UNAUTHORIZED", "Unauthorized");

  try {
    const [habit] = await db
      .select()
      .from(habits)
      .where(eq(habits.id, habitId));
    if (!habit || habit.userId !== userId) {
      throw new ServerError("NOT_FOUND", "Habit not found");
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await db.transaction(async (tx) => {
      if (isCompleted) {
        await tx.insert(habitLogs).values({
          id: crypto.randomUUID(),
          habitId,
          userId,
          completedAt: now,
          createdAt: now,
          updatedAt: now,
          hasPhoto: false,
        });

        await tx
          .update(habits)
          .set({
            lastCompleted: now,
            streak: habit.streak + 1,
            longestStreak: Math.max(habit.longestStreak, habit.streak + 1),
            updatedAt: now,
          })
          .where(eq(habits.id, habitId));
      } else {
        const [log] = await tx
          .select()
          .from(habitLogs)
          .where(
            and(
              eq(habitLogs.habitId, habitId),
              between(habitLogs.completedAt, today, tomorrow)
            )
          );

        if (log) {
          await tx.delete(habitLogs).where(eq(habitLogs.id, log.id));
          await tx
            .update(habits)
            .set({
              lastCompleted: null,
              streak: Math.max(0, habit.streak - 1),
              updatedAt: now,
            })
            .where(eq(habits.id, habitId));
        }
      }
    });

    revalidatePath("/");
    const [updatedHabit] = await db
      .select()
      .from(habits)
      .where(eq(habits.id, habitId));

    return updatedHabit;
  } catch (error) {
    if (error instanceof ServerError) throw error;
    console.error("Error toggling habit:", error);
    throw new ServerError(
      "INTERNAL_SERVER_ERROR",
      "Failed to toggle habit",
      error
    );
  }
}

export async function deleteHabit(habitId: string) {
  const { userId } = await auth();
  if (!userId) throw new ServerError("UNAUTHORIZED", "Unauthorized");

  try {
    const [habit] = await db
      .select()
      .from(habits)
      .where(eq(habits.id, habitId));
    if (!habit || habit.userId !== userId) {
      throw new ServerError("NOT_FOUND", "Habit not found");
    }

    await db.transaction(async (tx) => {
      await tx.delete(habitLogs).where(eq(habitLogs.habitId, habitId));
      await tx.delete(habits).where(eq(habits.id, habitId));
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    if (error instanceof ServerError) throw error;
    console.error("Error deleting habit:", error);
    throw new ServerError(
      "INTERNAL_SERVER_ERROR",
      "Failed to delete habit",
      error
    );
  }
}

export async function getHabitLogs(
  habitId: string,
  startDate: Date,
  endDate: Date
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [habit] = await db.select().from(habits).where(eq(habits.id, habitId));
  if (!habit || habit.userId !== userId) throw new Error("Habit not found");

  return db
    .select()
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.habitId, habitId),
        between(habitLogs.completedAt, startDate, endDate)
      )
    )
    .orderBy(habitLogs.completedAt);
}
