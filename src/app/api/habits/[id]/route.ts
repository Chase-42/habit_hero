import { NextResponse } from "next/server";
import { getHabitById, updateHabit, deleteHabit } from "~/server/queries";
import type { Habit, HabitColor, FrequencyType, HabitCategory } from "~/types";
import { z } from "zod";

type RouteContext = {
  params: {
    id: string;
  };
};

const updateHabitInput = z.object({
  name: z.string().optional(),
  color: z
    .enum([
      "red",
      "green",
      "blue",
      "yellow",
      "purple",
      "pink",
      "orange",
    ] as const satisfies readonly HabitColor[])
    .optional(),
  frequencyType: z
    .enum([
      "daily",
      "weekly",
      "monthly",
    ] as const satisfies readonly FrequencyType[])
    .optional(),
  frequencyValue: z
    .object({
      days: z.array(z.number()).optional(),
      times: z.number().optional(),
    })
    .optional(),
  category: z
    .enum([
      "fitness",
      "nutrition",
      "mindfulness",
      "productivity",
      "other",
    ] as const satisfies readonly HabitCategory[])
    .optional(),
  isActive: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  description: z.string().nullable().optional(),
  subCategory: z.string().nullable().optional(),
  goal: z.number().nullable().optional(),
  metricType: z.string().nullable().optional(),
  units: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  reminder: z.coerce.date().nullable().optional(),
  reminderEnabled: z.boolean().nullable().optional(),
}) satisfies z.ZodType<
  Partial<
    Omit<
      Habit,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "streak"
      | "longestStreak"
      | "lastCompleted"
      | "userId"
    >
  >
>;

export async function GET(
  request: Request,
  context: RouteContext
): Promise<NextResponse<Habit | { error: string }>> {
  try {
    const habit = await getHabitById(context.params.id);
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }
    return NextResponse.json(habit);
  } catch (error) {
    console.error("Error fetching habit:", error);
    return NextResponse.json(
      { error: "Failed to fetch habit" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext
): Promise<
  NextResponse<{ success: true } | { error: string | z.ZodError["errors"] }>
> {
  try {
    const updates = updateHabitInput.parse(await request.json());
    await updateHabit(context.params.id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error updating habit:", error);
    return NextResponse.json(
      { error: "Failed to update habit" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
): Promise<NextResponse<{ success: true } | { error: string }>> {
  try {
    await deleteHabit(context.params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting habit:", error);
    return NextResponse.json(
      { error: "Failed to delete habit" },
      { status: 500 }
    );
  }
}
