/**
 * Dependency injection container setup.
 * This file configures the DI container with all application dependencies.
 */

import "reflect-metadata";
import { container } from "tsyringe";
import { TYPES } from "./tokens";
import { DashboardRepository } from "~/infrastructure/dashboard/repositories/dashboard-repository";
import { DashboardUseCase } from "~/application/dashboard/use-cases/dashboard-use-case";
import {
  type IDashboardRepository,
  type IDashboardUseCase,
} from "~/application/dashboard/interfaces";

// Import repositories
import { DrizzleHabitRepository } from "~/infrastructure/repositories/drizzle-habit-repository";
import { DrizzleHabitLogRepository } from "~/infrastructure/repositories/drizzle-habit-log-repository";
import type { IHabitRepository } from "~/domain/repositories/habit-repository";
import type { IHabitLogRepository } from "~/domain/repositories/habit-log-repository";

// Import services
import { ClerkAuthService } from "~/infrastructure/services/clerk-auth-service";
import { StreakCalculationService } from "~/domain/services/streak-calculation-service";
import { HabitCompletionService } from "~/domain/services/habit-completion-service";
import { HabitArchiveService } from "~/domain/services/habit-archive-service";
import type { IStreakCalculationService } from "~/domain/services/interfaces/streak-calculation-service.interface";
import type { IHabitCompletionService } from "~/domain/services/interfaces/habit-completion-service.interface";
import type { IHabitArchiveService } from "~/domain/services/interfaces/habit-archive-service.interface";

// Import use cases
import { HabitUseCase } from "~/application/use-cases/habit/implementation";
import type { IHabitUseCase } from "~/application/use-cases/habit/interface";

// Import controllers
import { HabitController } from "~/interface-adapters/controllers/habit-controller";

// Register repositories
container.register("DashboardRepository", {
  useClass: DashboardRepository,
});

// Register services first since they are dependencies of repositories
container.register<IStreakCalculationService>(TYPES.StreakCalculationService, {
  useClass: StreakCalculationService,
});

container.register<IHabitCompletionService>(TYPES.HabitCompletionService, {
  useClass: HabitCompletionService,
});

container.register<IHabitArchiveService>(TYPES.HabitArchiveService, {
  useClass: HabitArchiveService,
});

// Register repositories
container.register<IHabitRepository>(TYPES.HabitRepository, {
  useClass: DrizzleHabitRepository,
});

container.register<IHabitLogRepository>(TYPES.HabitLogRepository, {
  useClass: DrizzleHabitLogRepository,
});

// Register auth service
container.register(TYPES.AuthService, {
  useClass: ClerkAuthService,
});

// Register use cases
container.register("DashboardUseCase", {
  useClass: DashboardUseCase,
});

container.register<IHabitUseCase>(TYPES.HabitUseCase, {
  useClass: HabitUseCase,
});

// Register controllers
container.register(TYPES.HabitController, {
  useClass: HabitController,
});

export function getHabitUseCase() {
  return container.resolve<IHabitUseCase>(TYPES.HabitUseCase);
}

export { container };
