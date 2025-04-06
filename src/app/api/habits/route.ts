import "reflect-metadata";
import "~/di/setup";
import { container } from "tsyringe";
import { HabitController } from "~/interface-adapters/controllers/habit-controller";
import { TYPES } from "~/di/tokens";

// Create a new instance of the controller with resolved dependencies
const controller = new HabitController(container.resolve(TYPES.HabitUseCase));

export async function GET(request: Request) {
  return controller.getHabits(request);
}

export async function POST(request: Request) {
  return controller.createHabit(request);
}
