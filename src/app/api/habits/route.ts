import { NextResponse } from "next/server";
import { createHabit, getHabits } from "~/server/queries";
import type { Habit, HabitColor, FrequencyType, HabitCategory } from "~/types";
import { z } from "zod";

const habitInput = z.object({
  name: z.string(),
  userId: z.string(),
  color: z.enum([
    "red",
    "green",
    "blue",
    "yellow",
    "purple",
    "pink",
    "orange",
  ] as const satisfies readonly HabitColor[]),
  frequencyType: z.enum([
    "daily",
    "weekly",
    "monthly",
  ] as const satisfies readonly FrequencyType[]),
  frequencyValue: z.object({
    days: z.array(z.number()).optional(),
    times: z.number().optional(),
  }),
  category: z.enum([
    "fitness",
    "nutrition",
    "mindfulness",
    "productivity",
    "other",
  ] as const satisfies readonly HabitCategory[]),
  isActive: z.literal(true),
  isArchived: z.literal(false),
  // Optional fields
  description: z.string().nullable(),
  subCategory: z.string().nullable(),
  goal: z.number().nullable(),
  metricType: z.string().nullable(),
  units: z.string().nullable(),
  notes: z.string().nullable(),
  reminder: z.coerce.date().nullable(),
  reminderEnabled: z.boolean().nullable(),
  lastCompleted: z.coerce.date().nullable(),
}) satisfies z.ZodType<
  Omit<Habit, "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak">
>;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const habits = await getHabits(userId);
    return NextResponse.json(habits);
  } catch (error) {
    console.error("Error fetching habits:", error);
    return NextResponse.json(
      { error: "Failed to fetch habits" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const input = habitInput.parse(await request.json());
    const habit = await createHabit(input);
    return NextResponse.json(habit);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating habit:", error);
    return NextResponse.json(
      { error: "Failed to create habit" },
      { status: 500 }
    );
  }
}
