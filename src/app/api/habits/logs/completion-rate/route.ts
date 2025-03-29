import { NextResponse } from "next/server";
import { container } from "tsyringe";
import { GetHabitCompletionRateUseCase } from "~/application/use-cases/get-habit-completion-rate.use-case";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const habitId = searchParams.get("habitId");
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!habitId || !userId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const useCase = container.resolve(GetHabitCompletionRateUseCase);
    const result = await useCase.execute({
      habitId,
      userId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error("Error getting habit completion rate:", error);
    return NextResponse.json(
      { error: "Failed to get habit completion rate" },
      { status: 500 }
    );
  }
}
