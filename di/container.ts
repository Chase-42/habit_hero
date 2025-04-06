/**
 * Dependency injection container setup.
 * This file configures the DI container with all application dependencies.
 */

import "reflect-metadata";
import { container, type DependencyContainer } from "tsyringe";
import { TYPES } from "@di/tokens";
import { DashboardRepository } from "~/infrastructure/dashboard/repositories/dashboard-repository";
import { DashboardUseCase } from "~/application/dashboard/use-cases/dashboard-use-case";
import type { IDashboardRepository } from "~/application/dashboard/interfaces";
import type { IDashboardUseCase } from "~/application/dashboard/interfaces";

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
import type { AuthService } from "~/application/services/auth-service";

// Import use cases
import { HabitUseCase } from "~/application/use-cases/habit/implementation";
import type { IHabitUseCase } from "~/application/use-cases/habit/interface";

// Import controllers
import { HabitController } from "~/interface-adapters/controllers/habit-controller";

// Register repositories
container.registerSingleton<IDashboardRepository>(
  TYPES.DashboardRepository,
  DashboardRepository
);

// Register services first since they are dependencies of repositories
container.registerSingleton<IStreakCalculationService>(
  TYPES.StreakCalculationService,
  StreakCalculationService
);

container.registerSingleton<IHabitCompletionService>(
  TYPES.HabitCompletionService,
  HabitCompletionService
);

container.registerSingleton<IHabitArchiveService>(
  TYPES.HabitArchiveService,
  HabitArchiveService
);

// Register repositories
container.registerSingleton<IHabitRepository>(
  TYPES.HabitRepository,
  DrizzleHabitRepository
);

container.registerSingleton<IHabitLogRepository>(
  TYPES.HabitLogRepository,
  DrizzleHabitLogRepository
);

// Register auth service
container.registerSingleton<AuthService>(TYPES.AuthService, ClerkAuthService);

// Register use cases
container.registerSingleton<IDashboardUseCase>(
  TYPES.DashboardUseCase,
  DashboardUseCase
);

container.registerSingleton<IHabitUseCase>(TYPES.HabitUseCase, HabitUseCase);

// Register controllers
container.registerSingleton<HabitController>(
  TYPES.HabitController,
  HabitController
);

export function getHabitUseCase() {
  return container.resolve<IHabitUseCase>(TYPES.HabitUseCase);
}

export { container };
