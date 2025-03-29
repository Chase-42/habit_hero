import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createHabit, getHabits } from "~/server/queries/habits";
import { newHabitSchema } from "~/schemas/habit";
import { z } from "zod";
import type { ApiResponse } from "~/types/api/validation";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Unauthorized access",
          },
        },
        { status: 401 }
      );
    }
    const habits = await getHabits(userId);
    return NextResponse.json<ApiResponse<typeof habits>>({ data: habits });
  } catch (error) {
    console.error("Error fetching habits:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: {
          code: "FETCH_ERROR",
          message: "Failed to fetch habits",
          details:
            error instanceof Error
              ? [{ field: "general", message: error.message }]
              : undefined,
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Unauthorized access",
          },
        },
        { status: 401 }
      );
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
    return NextResponse.json<ApiResponse<typeof createdHabit>>({
      data: createdHabit,
    });
  } catch (error) {
    console.error("Error creating habit:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid habit data",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
        },
        { status: 400 }
      );
    }
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: {
          code: "CREATE_ERROR",
          message: "Failed to create habit",
          details:
            error instanceof Error
              ? [{ field: "general", message: error.message }]
              : undefined,
        },
      },
      { status: 500 }
    );
  }
}
