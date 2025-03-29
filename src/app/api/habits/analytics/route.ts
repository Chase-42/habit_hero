import { NextResponse } from "next/server";
import { getCompletionHistory, getStreakHistory } from "~/server/queries";
import { z } from "zod";
import type { ApiResponse } from "~/types/api/validation";

const completionQuerySchema = z.object({
  habitId: z.string(),
  groupBy: z.enum(["day", "week", "month"]).optional(),
});

const streakQuerySchema = z.object({
  habitId: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (!type) {
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: "type parameter (completion or streak) is required",
        },
      },
      { status: 400 }
    );
  }

  try {
    if (type === "completion") {
      const result = completionQuerySchema.safeParse({
        habitId: searchParams.get("habitId"),
        groupBy: searchParams.get("groupBy"),
      });

      if (!result.success) {
        return NextResponse.json<ApiResponse<null>>(
          {
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid completion query parameters",
              details: result.error.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message,
              })),
            },
          },
          { status: 400 }
        );
      }

      const { habitId, groupBy } = result.data;
      const history = await getCompletionHistory(habitId, groupBy);
      return NextResponse.json<ApiResponse<typeof history>>({ data: history });
    }

    if (type === "streak") {
      const result = streakQuerySchema.safeParse({
        habitId: searchParams.get("habitId"),
        startDate: searchParams.get("startDate"),
        endDate: searchParams.get("endDate"),
      });

      if (!result.success) {
        return NextResponse.json<ApiResponse<null>>(
          {
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid streak query parameters",
              details: result.error.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message,
              })),
            },
          },
          { status: 400 }
        );
      }

      const { habitId, startDate, endDate } = result.data;
      const history = await getStreakHistory(
        habitId,
        startDate ? new Date(startDate) : null,
        endDate ? new Date(endDate) : null
      );
      return NextResponse.json<ApiResponse<typeof history>>({ data: history });
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid type parameter. Must be 'completion' or 'streak'",
        },
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: {
          code: "FETCH_ERROR",
          message: "Failed to fetch analytics",
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
