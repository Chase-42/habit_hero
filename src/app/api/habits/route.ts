import "reflect-metadata";
import { container } from "../../../infrastructure/container";
import type { HabitController } from "../../../interface-adapters/controllers/habit.controller";
import { z } from "zod";
import type { HabitDB } from "../../../entities/models/habit";
import {
  CreateHabitSchema,
  HabitColorSchema,
  FrequencyTypeSchema,
  FrequencyValueSchema,
  HabitCategorySchema,
  transformFromDBHabit,
  transformToDBHabit,
} from "../../../entities/models/habit";
import { withErrorHandler } from "../../../interface-adapters/middleware/error-handler.middleware";
import { withAuth } from "../../../interface-adapters/middleware/auth.middleware";

// Get all habits
export const GET = withErrorHandler(
  withAuth(async (request: Request) => {
    const controller = container.resolve<HabitController>("HabitController");
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response("Missing userId parameter", { status: 400 });
    }

    const result = await controller.getHabits(userId);
    if (!result.ok) {
      console.error("Error details:", result.error);
      return Response.json({ error: result.error.message }, { status: 500 });
    }
    return Response.json(result.value);
  })
);

// Create a new habit
export const POST = withErrorHandler(
  withAuth(async (request: Request) => {
    const controller = container.resolve<HabitController>("HabitController");
    const body = (await request.json()) as unknown;
    console.log("Received request body:", JSON.stringify(body, null, 2));

    try {
      // Validate the request body
      const validatedData = CreateHabitSchema.parse(body);
      console.log("Validated data:", JSON.stringify(validatedData, null, 2));

      // Create the habit
      const result = await controller.createHabit(validatedData);
      if (!result.ok) {
        console.error("Failed to create habit:", result.error);
        return Response.json({ error: result.error.message }, { status: 400 });
      }

      console.log(
        "Successfully created habit:",
        JSON.stringify(result.value, null, 2)
      );
      return Response.json(result.value, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        console.error(
          "Validation errors:",
          JSON.stringify(formattedErrors, null, 2)
        );
        return Response.json(
          {
            error: "Validation failed",
            details: formattedErrors,
          },
          { status: 400 }
        );
      }
      console.error("Error creating habit:", error);
      return Response.json(
        { error: "Failed to create habit" },
        { status: 500 }
      );
    }
  })
);
