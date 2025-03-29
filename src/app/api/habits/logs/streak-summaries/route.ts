import { NextResponse } from "next/server";
import { container } from "~/infrastructure/container";
import { HabitLogController } from "~/interface-adapters/controllers/habit-log.controller";

const controller = container.resolve(HabitLogController);

export async function GET(request: Request): Promise<Response> {
  return controller.getStreakSummaries(request);
}
