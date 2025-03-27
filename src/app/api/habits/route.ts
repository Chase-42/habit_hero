import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createHabit, getHabits } from "~/server/queries";
import type { Habit } from "~/types";
import { habitInputSchema } from "~/schemas";
import { z } from "zod";

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const input = habitInputSchema.parse(await request.json());
    const habit = await createHabit({ ...input, userId });
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
