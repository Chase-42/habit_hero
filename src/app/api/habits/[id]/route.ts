import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getHabitById, updateHabit, deleteHabit } from "~/server/queries";
import type { Habit } from "~/types";
import type { RouteContext, RouteParams } from "~/types/route";
import { updateHabitSchema } from "~/schemas";
import type { ApiResponse } from "~/types/api/validation";
import { z } from "zod";

type HabitResponse = NextResponse<ApiResponse<Habit>>;
type NullResponse = NextResponse<ApiResponse<null>>;
type SuccessResponse = NextResponse<ApiResponse<{ success: true }>>;

export async function GET(
  request: Request,
  context: RouteContext<Promise<RouteParams>>
): Promise<HabitResponse | NullResponse> {
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

  try {
    const { id } = await context.params;
    const habit = await getHabitById(id);
    if (!habit || habit.userId !== userId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "Habit not found or unauthorized",
          },
        },
        { status: 404 }
      );
    }
    return NextResponse.json<ApiResponse<Habit>>({ data: habit });
  } catch (error) {
    console.error("Error fetching habit:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: {
          code: "FETCH_ERROR",
          message: "Failed to fetch habit",
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

export async function PUT(
  request: Request,
  context: RouteContext<Promise<RouteParams>>
): Promise<HabitResponse | NullResponse> {
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

  try {
    const { id } = await context.params;
    const habit = await getHabitById(id);
    if (!habit || habit.userId !== userId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "Habit not found or unauthorized",
          },
        },
        { status: 404 }
      );
    }

    const input = updateHabitSchema.parse(await request.json());
    await updateHabit(id, input);
    const updatedHabit = await getHabitById(id);
    if (!updatedHabit) {
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "Habit not found",
          },
        },
        { status: 404 }
      );
    }
    return NextResponse.json<ApiResponse<Habit>>({ data: updatedHabit });
  } catch (error) {
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
    console.error("Error updating habit:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: {
          code: "UPDATE_ERROR",
          message: "Failed to update habit",
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

export async function DELETE(
  request: Request,
  context: RouteContext<Promise<RouteParams>>
): Promise<SuccessResponse | NullResponse> {
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

  try {
    const { id } = await context.params;
    const habit = await getHabitById(id);

    if (!habit) {
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "Habit not found",
          },
        },
        { status: 404 }
      );
    }

    if (habit.userId !== userId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: {
            code: "FORBIDDEN",
            message: "You don't have permission to delete this habit",
          },
        },
        { status: 403 }
      );
    }

    await deleteHabit(id);
    return NextResponse.json<ApiResponse<{ success: true }>>({
      data: { success: true },
    });
  } catch (error) {
    console.error("Error deleting habit:", error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("foreign key constraint")) {
        return NextResponse.json<ApiResponse<null>>(
          {
            data: null,
            error: {
              code: "CONSTRAINT_ERROR",
              message: "Cannot delete habit due to existing references",
              details: [
                {
                  field: "database",
                  message: error.message,
                },
              ],
            },
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: {
          code: "DELETE_ERROR",
          message: "Failed to delete habit",
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
