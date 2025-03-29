import { NextResponse } from "next/server";
import { container } from "~/frameworks/di/container";
import { type HabitLogController } from "~/interface-adapters/controllers/habit-log.controller";

const controller = container.resolve<HabitLogController>("HabitLogController");

export async function POST(request: Request): Promise<Response> {
  return controller.create(request);
}

export async function GET(request: Request): Promise<Response> {
  return controller.getLogs(request);
}

export async function DELETE(request: Request): Promise<Response> {
  return controller.deleteLog(request);
}
