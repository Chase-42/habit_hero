import "reflect-metadata";
import { container } from "tsyringe";
import { HabitRepository } from "./repositories/habit-repository";
import { HabitLogRepository } from "./repositories/habit-log-repository";
import { StreakCalculator } from "./services/streak-calculator";
import { HabitAnalytics } from "./services/habit-analytics";
import { ValidationService } from "./services/validation.service";
import { HabitController } from "../interface-adapters/controllers/habit.controller";
import { CreateHabitUseCase } from "../application/use-cases/habits/create-habit";
import { LogHabitUseCase } from "../application/use-cases/log-habit";
import { ToggleHabitUseCaseImpl } from "../application/use-cases/habits/toggle-habit";
import { GetGoalsUseCaseImpl } from "../application/use-cases/goals/get-goals";
import { GoalControllerImpl } from "../interface-adapters/controllers/goal.controller";
import { GoalRepository } from "./repositories/goal-repository";
import {
  type IHabitRepository,
  type IHabitLogRepository,
  type IGoalRepository,
} from "../application/interfaces/repositories";
import { type GetGoalsUseCase } from "../application/use-cases/goals/get-goals";
import { type CreateGoalUseCase } from "../application/use-cases/goals/create-goal";
import { CreateGoalUseCaseImpl } from "../application/use-cases/goals/create-goal";
import { type UpdateGoalUseCase } from "../application/use-cases/goals/update-goal";
import { UpdateGoalUseCaseImpl } from "../application/use-cases/goals/update-goal";
import { type GetGoalUseCase } from "../application/use-cases/goals/get-goal";
import { GetGoalUseCaseImpl } from "../application/use-cases/goals/get-goal";
import { type DeleteGoalUseCase } from "../application/use-cases/goals/delete-goal";
import { DeleteGoalUseCaseImpl } from "../application/use-cases/goals/delete-goal";
import { type GoalController } from "../interface-adapters/controllers/goal.controller";
import { HabitControllerImpl } from "../interface-adapters/controllers/habit.controller";
import { HabitLogController } from "../interface-adapters/controllers/habit-log.controller";
import { AddHabitLogUseCase } from "../application/use-cases/add-habit-log.use-case";
import { GetHabitAnalyticsUseCase } from "../application/use-cases/get-habit-analytics.use-case";
import { GetHabitLogsUseCase } from "../application/use-cases/get-habit-logs.use-case";
import { DeleteHabitLogUseCase } from "../application/use-cases/delete-habit-log.use-case";

// Register repositories
container.registerSingleton<IHabitRepository>(
  "IHabitRepository",
  HabitRepository
);

container.registerSingleton<IHabitLogRepository>(
  "IHabitLogRepository",
  HabitLogRepository
);

container.registerSingleton<IGoalRepository>("IGoalRepository", GoalRepository);

// Register services
container.register("StreakCalculator", {
  useClass: StreakCalculator,
});

container.register("HabitAnalytics", {
  useClass: HabitAnalytics,
});

container.register("ValidationService", {
  useClass: ValidationService,
});

// Register use cases
container.register("CreateHabitUseCase", {
  useClass: CreateHabitUseCase,
});

container.register("LogHabitUseCase", {
  useClass: LogHabitUseCase,
});

container.register("ToggleHabitUseCase", {
  useClass: ToggleHabitUseCaseImpl,
});

container.register<AddHabitLogUseCase>("AddHabitLogUseCase", {
  useClass: AddHabitLogUseCase,
});

container.register<GetHabitAnalyticsUseCase>("GetHabitAnalyticsUseCase", {
  useClass: GetHabitAnalyticsUseCase,
});

container.register<GetHabitLogsUseCase>("GetHabitLogsUseCase", {
  useClass: GetHabitLogsUseCase,
});

container.register<DeleteHabitLogUseCase>("DeleteHabitLogUseCase", {
  useClass: DeleteHabitLogUseCase,
});

// Register controllers
container.registerSingleton("HabitController", HabitControllerImpl);
container.registerSingleton<HabitLogController>(
  "HabitLogController",
  HabitLogController
);

// Goal Use Cases
container.register<GetGoalsUseCase>("GetGoalsUseCase", {
  useClass: GetGoalsUseCaseImpl,
});

container.register<CreateGoalUseCase>("CreateGoalUseCase", {
  useClass: CreateGoalUseCaseImpl,
});

container.register<UpdateGoalUseCase>("UpdateGoalUseCase", {
  useClass: UpdateGoalUseCaseImpl,
});

container.register<GetGoalUseCase>("GetGoalUseCase", {
  useClass: GetGoalUseCaseImpl,
});

container.register<DeleteGoalUseCase>("DeleteGoalUseCase", {
  useClass: DeleteGoalUseCaseImpl,
});

// Goal Controller
container.register<GoalController>("GoalController", {
  useClass: GoalControllerImpl,
});

export { container };
