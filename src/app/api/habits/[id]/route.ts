import "reflect-metadata";
import "~/di/setup";
import { container } from "tsyringe";
import { HabitController } from "~/interface-adapters/controllers/habit-controller";
import { HabitUseCase } from "~/application/use-cases/habit/implementation";

const controller = new HabitController(container.resolve(HabitUseCase));

export async function GET(request: Request) {
  return controller.getHabit(request);
}

export async function PUT(request: Request) {
  return controller.updateHabit(request);
}

export async function DELETE(request: Request) {
  return controller.deleteHabit(request);
}

export async function POST(request: Request) {
  return controller.completeHabit(request);
}
