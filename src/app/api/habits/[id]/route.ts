import "reflect-metadata";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { container } from "../../../../infrastructure/container";
import { type HabitController } from "../../../../interface-adapters/controllers/habit.controller";
import { z } from "zod";
import {
  HabitSchema,
  HabitColorSchema,
  FrequencyTypeSchema,
  FrequencyValueSchema,
  HabitCategorySchema,
} from "../../../../entities/models/habit";
import { ValidationError, NotFoundError } from "../../../../entities/errors";
import type { Habit } from "../../../../entities/models/habit";
import { db } from "~/server/db";
import { habits } from "~/server/db/schema";
import { eq } from "drizzle-orm";

const updateHabitSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: HabitColorSchema.optional(),
  frequencyType: FrequencyTypeSchema.optional(),
  frequencyValue: FrequencyValueSchema.optional(),
  category: HabitCategorySchema.optional(),
  isActive: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  description: z.string().nullable().optional(),
  subCategory: z.string().nullable().optional(),
  goal: z.number().positive().nullable().optional(),
  metricType: z.string().nullable().optional(),
  units: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  reminder: z.date().nullable().optional(),
  reminderEnabled: z.boolean().optional(),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop() ?? "";
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [habit] = await db.select().from(habits).where(eq(habits.id, id));

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    return NextResponse.json(habit);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop() ?? "";
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as unknown;
    const validatedData = updateHabitSchema.parse(body);

    const habitController =
      container.resolve<HabitController>("HabitController");
    const habitResult = await habitController.getHabit(id);

    if (!habitResult.ok) {
      return NextResponse.json(
        { error: "Failed to fetch habit" },
        { status: 500 }
      );
    }

    const habit = habitResult.value;
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    if (validatedData.isActive !== undefined) {
      const result = await habitController.toggleHabit(
        id,
        userId,
        validatedData.isActive
      );

      if (!result.ok) {
        if (result.error instanceof ValidationError) {
          return NextResponse.json(
            { error: result.error.message },
            { status: 400 }
          );
        }
        if (result.error instanceof NotFoundError) {
          return NextResponse.json(
            { error: result.error.message },
            { status: 404 }
          );
        }
        return NextResponse.json(
          { error: "Failed to update habit" },
          { status: 500 }
        );
      }

      return NextResponse.json(result.value);
    }

    return NextResponse.json(
      { error: "Full habit updates not yet implemented" },
      { status: 501 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid habit data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop() ?? "";
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const habitController =
      container.resolve<HabitController>("HabitController");
    const result = await habitController.deleteHabit(id);

    if (!result.ok) {
      if (result.error instanceof NotFoundError) {
        return NextResponse.json(
          { error: result.error.message },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to delete habit" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
