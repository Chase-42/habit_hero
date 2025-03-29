import { NextResponse } from "next/server";
import { z } from "zod";
import type { HabitFilters } from "~/types";
import { getFilteredHabits } from "~/server/queries/habits";
import { HabitCategory, SortField, SortOrder } from "~/types/common/enums";

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
    return NextResponse.json(habits);
  } catch (error) {
    console.error("Error fetching filtered habits:", error);
    return NextResponse.json(
      { error: "Failed to fetch filtered habits" },
      { status: 500 }
    );
  }
}
