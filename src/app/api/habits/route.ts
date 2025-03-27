import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createHabit, getHabits } from "~/server/queries/habits";
import { newHabitSchema } from "~/schemas/habit";
import type { z } from "zod";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as unknown as z.infer<
      typeof newHabitSchema
    >;
    const habit = newHabitSchema.parse(body);
    const createdHabit = await createHabit({
      ...habit,
      userId,
      lastCompleted: null,
    });
    return NextResponse.json(createdHabit);
  } catch (error) {
    console.error("Error creating habit:", error);
    return NextResponse.json(
      { error: "Failed to create habit" },
      { status: 500 }
    );
  }
}
