import "reflect-metadata";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { container } from "../../../../../infrastructure/container";
import { type HabitController } from "../../../../../interface-adapters/controllers/habit.controller";
import { z } from "zod";
import { ValidationError, NotFoundError } from "../../../../../entities/errors";

const toggleHabitSchema = z.object({
  completed: z.boolean(),
  userId: z.string(),
});

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("Toggle habit request received");
    const url = new URL(request.url);
    const id = url.pathname.split("/")[3] ?? "";
    console.log("Habit ID:", id);

    const body = (await request.json()) as unknown;
    console.log("Request body:", JSON.stringify(body, null, 2));

    try {
      const validatedData = toggleHabitSchema.parse(body);
      console.log("Validated data:", JSON.stringify(validatedData, null, 2));

      const habitController =
        container.resolve<HabitController>("HabitController");
      console.log("Calling toggleHabit with:", {
        id,
        userId: validatedData.userId,
        completed: validatedData.completed,
      });

      const result = await habitController.toggleHabit(
        id,
        validatedData.userId,
        validatedData.completed
      );

      if (!result.ok) {
        console.error("Toggle habit failed:", result.error);
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
          { error: "Failed to toggle habit" },
          { status: 500 }
        );
      }

      console.log("Toggle habit successful");
      return NextResponse.json(result.value);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid toggle data", details: validationError.errors },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error("Unhandled error in toggle habit handler:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export const POST = PUT;
