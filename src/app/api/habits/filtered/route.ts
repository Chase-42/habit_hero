import { NextResponse } from "next/server";
import { getFilteredHabits } from "~/server/queries";
import { z } from "zod";
import type { HabitFilters } from "~/types";

const filterSchema = z.object({
  userId: z.string(),
  isActive: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  category: z
    .enum(["fitness", "nutrition", "mindfulness", "productivity", "other"])
    .optional(),
  searchQuery: z.string().optional(),
  sortBy: z.enum(["name", "createdAt", "category"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
}) satisfies z.ZodType<HabitFilters>;

export async function POST(request: Request) {
  try {
    const filters = filterSchema.parse(await request.json());
    const habits = await getFilteredHabits(filters);
    return NextResponse.json(habits);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error filtering habits:", error);
    return NextResponse.json(
      { error: "Failed to filter habits" },
      { status: 500 }
    );
  }
}
