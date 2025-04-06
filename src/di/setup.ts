/**
 * Dependency injection setup.
 * This file initializes the DI container and exports it for use throughout the application.
 */

import "reflect-metadata";
import { container } from "tsyringe";
import { TYPES } from "./tokens";

// Import repositories
import { DrizzleHabitRepository } from "~/infrastructure/repositories/drizzle-habit-repository";
import { DrizzleHabitLogRepository } from "~/infrastructure/repositories/drizzle-habit-log-repository";
import type { IHabitRepository } from "~/domain/repositories/habit-repository";
import type { IHabitLogRepository } from "~/domain/repositories/habit-log-repository";

// Import services
import { StreakCalculationService } from "~/domain/services/streak-calculation-service";
import { HabitCompletionService } from "~/domain/services/habit-completion-service";
import { HabitArchiveService } from "~/domain/services/habit-archive-service";
import type { IStreakCalculationService } from "~/domain/services/interfaces/streak-calculation-service.interface";
import type { IHabitCompletionService } from "~/domain/services/interfaces/habit-completion-service.interface";
import type { IHabitArchiveService } from "~/domain/services/interfaces/habit-archive-service.interface";

// Import use cases
import { HabitUseCase } from "~/application/use-cases/habit/implementation";
import type { IHabitUseCase } from "~/application/use-cases/habit/interface";

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

// Register use cases
container.register<IHabitUseCase>(TYPES.HabitUseCase, {
  useClass: HabitUseCase,
});

// Export the container for use in the application
export { container };
