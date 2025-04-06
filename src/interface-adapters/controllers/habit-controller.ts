import { auth } from "@clerk/nextjs/server";
import { type HabitUseCase } from "~/application/use-cases/habit/implementation";
import { NextResponse } from "next/server";
import type { CreateHabitInput, UpdateHabitInput } from "~/domain/models/habit";
import type { FrequencyValue } from "~/domain/utils/frequency";

export class HabitController {
  constructor(private readonly habitUseCase: HabitUseCase) {}

  async createHabit(request: Request) {
    try {
      const session = await auth();
      if (!session.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = (await request.json()) as Omit<CreateHabitInput, "userId">;
      const result = await this.habitUseCase.createHabit({
        ...body,
        userId: session.userId,
        frequencyValue: body.frequencyValue as FrequencyValue,
      });

      return NextResponse.json(result);
    } catch (error) {
      console.error("Error creating habit:", error);
      return NextResponse.json(
        { error: "Failed to create habit" },
        { status: 500 }
      );
    }
  }

  async getHabit(request: Request) {
    try {
      const session = await auth();
      if (!session.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");
      if (!id) {
        return NextResponse.json(
          { error: "Habit ID is required" },
          { status: 400 }
        );
      }

      const result = await this.habitUseCase.getHabit(id, session.userId);
      return NextResponse.json(result);
    } catch (error) {
      console.error("Error getting habit:", error);
      return NextResponse.json(
        { error: "Failed to get habit" },
        { status: 500 }
      );
    }
  }

  async getHabits(request: Request) {
    try {
      const session = await auth();
      if (!session.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const result = await this.habitUseCase.getHabits(session.userId);
      return NextResponse.json({ data: result });
    } catch (error) {
      console.error("Error getting habits:", error);
      return NextResponse.json(
        { error: "Failed to get habits" },
        { status: 500 }
      );
    }
  }

  async updateHabit(request: Request) {
    try {
      const session = await auth();
      if (!session.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");
      if (!id) {
        return NextResponse.json(
          { error: "Habit ID is required" },
          { status: 400 }
        );
      }

      const body = (await request.json()) as UpdateHabitInput;
      const result = await this.habitUseCase.updateHabit({
        id,
        userId: session.userId,
        ...body,
        frequencyValue: body.frequencyValue as FrequencyValue,
      });
      return NextResponse.json(result);
    } catch (error) {
      console.error("Error updating habit:", error);
      return NextResponse.json(
        { error: "Failed to update habit" },
        { status: 500 }
      );
    }
  }

  async deleteHabit(request: Request) {
    try {
      const session = await auth();
      if (!session.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");
      if (!id) {
        return NextResponse.json(
          { error: "Habit ID is required" },
          { status: 400 }
        );
      }

      await this.habitUseCase.deleteHabit(id, session.userId);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting habit:", error);
      return NextResponse.json(
        { error: "Failed to delete habit" },
        { status: 500 }
      );
    }
  }

  async completeHabit(request: Request) {
    try {
      const session = await auth();
      if (!session.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = (await request.json()) as { habitId: string; note?: string };
      const result = await this.habitUseCase.completeHabit({
        habitId: body.habitId,
        userId: session.userId,
        notes: body.note,
      });

      return NextResponse.json(result);
    } catch (error) {
      console.error("Error completing habit:", error);
      return NextResponse.json(
        { error: "Failed to complete habit" },
        { status: 500 }
      );
    }
  }
}
