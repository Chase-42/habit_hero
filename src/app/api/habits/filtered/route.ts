import { NextResponse } from "next/server";
import { z } from "zod";
import type { HabitFilters } from "~/types";
import { getFilteredHabits } from "~/server/queries/habits";
import { HabitCategory, SortField, SortOrder } from "~/types/common/enums";
import type { ApiResponse } from "~/types/api/validation";

const filterSchema = z.object({
  userId: z.string(),
  isActive: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  category: z.nativeEnum(HabitCategory).optional(),
  searchQuery: z.string().optional(),
  sortBy: z.nativeEnum(SortField).optional(),
  sortOrder: z.nativeEnum(SortOrder).optional(),
}) satisfies z.ZodType<HabitFilters>;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown as z.infer<
      typeof filterSchema
    >;
    const filters = filterSchema.parse(body);
    const habits = await getFilteredHabits(filters);
    return NextResponse.json<ApiResponse<typeof habits>>({ data: habits });
  } catch (error) {
    console.error("Error fetching filtered habits:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid filter criteria",
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
          code: "FETCH_ERROR",
          message: "Failed to fetch filtered habits",
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
