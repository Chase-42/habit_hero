import "reflect-metadata";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { container } from "../../../../infrastructure/container";
import { type HabitController } from "../../../../interface-adapters/controllers/habit.controller";
import { z } from "zod";
import { ValidationError, NotFoundError } from "../../../../entities/errors";
import type { HabitFilters } from "../../../../entities/models/habit";
import type { HabitResponse } from "../../../../interface-adapters/presenters/habit.presenter";

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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const filters = filterSchema.parse(await request.json());
    const habitController =
      container.resolve<HabitController>("HabitController");
    const result = await habitController.findByUserId(filters.userId);

    if (!result.ok) {
      if (result.error instanceof NotFoundError) {
        return NextResponse.json(
          { error: result.error.message },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch habits" },
        { status: 500 }
      );
    }

    // Apply filters in memory for now
    // TODO: Move filtering logic to repository layer
    let habits = result.value;
    if (filters.isActive !== undefined) {
      habits = habits.filter((h) => h.isActive === filters.isActive);
    }
    if (filters.isArchived !== undefined) {
      habits = habits.filter((h) => h.isArchived === filters.isArchived);
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      habits = habits.filter((h) => {
        return (
          h.title.toLowerCase().includes(query) ||
          h.description?.toLowerCase().includes(query) ||
          h.category.toLowerCase().includes(query)
        );
      });
    }

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
