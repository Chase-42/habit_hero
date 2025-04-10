import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createHabit, getHabits } from "~/server/queries/habits";
import { newHabitSchema } from "~/schemas/habit";
import { z } from "zod";
import type { ApiResponse } from "~/types/api/validation";

export async function GET() {
  console.log("[API] GET /api/habits - Start");
  try {
    const { userId } = await auth();
    console.log("[API] GET /api/habits - User ID:", userId);
    if (!userId) {
      console.log("[API] GET /api/habits - Unauthorized");
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Unauthorized access",
          },
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        }
      );
    }
    console.log("[API] GET /api/habits - Fetching habits for user:", userId);
    const habits = await getHabits(userId);
    console.log(
      "[API] GET /api/habits - Success, found",
      habits.length,
      "habits"
    );
    return NextResponse.json<ApiResponse<typeof habits>>(
      { data: habits },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("[API] GET /api/habits - Error:", error);
    if (error instanceof Error) {
      console.error("[API] GET /api/habits - Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
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
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  }
}

export async function POST(request: Request) {
  console.log("[API] POST /api/habits - Start");
  try {
    const { userId } = await auth();
    console.log("[API] POST /api/habits - User ID:", userId);
    if (!userId) {
      console.log("[API] POST /api/habits - Unauthorized");
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Unauthorized access",
          },
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        }
      );
    }

    const body = (await request.json()) as unknown as z.infer<
      typeof newHabitSchema
    >;
    console.log("[API] POST /api/habits - Request body:", body);
    const habit = newHabitSchema.parse(body);
    const createdHabit = await createHabit({
      ...habit,
      userId,
      lastCompleted: null,
    });
    console.log(
      "[API] POST /api/habits - Success, created habit:",
      createdHabit.id
    );
    return NextResponse.json<ApiResponse<typeof createdHabit>>(
      { data: createdHabit },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("[API] POST /api/habits - Error:", error);
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
        {
          status: 400,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        }
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
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  }
}
