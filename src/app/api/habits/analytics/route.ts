import "reflect-metadata";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { container } from "../../../../infrastructure/container";
import { z } from "zod";
import { withErrorHandler } from "../../../../interface-adapters/middleware/error-handler.middleware";
import { withAuth } from "../../../../interface-adapters/middleware/auth.middleware";
import { ValidationError, NotFoundError } from "../../../../entities/errors";
import { type HabitAnalytics } from "../../../../infrastructure/services/habit-analytics";

const completionQuerySchema = z.object({
  habitId: z.string(),
  groupBy: z.enum(["day", "week", "month"]).optional(),
});

const streakQuerySchema = z.object({
  habitId: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const analyticsHandler = async (
  request: NextRequest
): Promise<NextResponse> => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (!type) {
    return NextResponse.json(
      { error: "type parameter (completion or streak) is required" },
      { status: 400 }
    );
  }

  try {
    const analytics = container.resolve<HabitAnalytics>("HabitAnalytics");

    if (type === "completion") {
      const result = completionQuerySchema.safeParse({
        habitId: searchParams.get("habitId"),
        groupBy: searchParams.get("groupBy"),
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.error.errors },
          { status: 400 }
        );
      }

      const { habitId, groupBy = "day" } = result.data;
      const history = await analytics.getCompletionHistory(habitId, groupBy);
      return NextResponse.json(history);
    }

    if (type === "streak") {
      const result = streakQuerySchema.safeParse({
        habitId: searchParams.get("habitId"),
        startDate: searchParams.get("startDate"),
        endDate: searchParams.get("endDate"),
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.error.errors },
          { status: 400 }
        );
      }

      const { habitId, startDate, endDate } = result.data;
      const history = await analytics.getStreakHistory(
        habitId,
        startDate ? new Date(startDate) : null,
        endDate ? new Date(endDate) : null
      );
      return NextResponse.json(history);
    }

    return NextResponse.json(
      { error: "Invalid type parameter. Must be 'completion' or 'streak'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
};

export const GET = analyticsHandler;
