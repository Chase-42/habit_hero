/**
 * Dependency injection tokens.
 * This file defines all the tokens used for dependency injection.
 */

import { type InjectionToken } from "tsyringe";
import type { IDashboardRepository } from "~/application/dashboard/interfaces";
import type { IDashboardUseCase } from "~/application/dashboard/interfaces";
import type { IStreakCalculationService } from "~/domain/services/interfaces/streak-calculation-service.interface";
import type { IHabitCompletionService } from "~/domain/services/interfaces/habit-completion-service.interface";
import type { IHabitArchiveService } from "~/domain/services/interfaces/habit-archive-service.interface";
import type { IHabitRepository } from "~/domain/repositories/habit-repository";
import type { IHabitLogRepository } from "~/domain/repositories/habit-log-repository";
import type { AuthService } from "~/application/services/auth-service";
import type { IHabitUseCase } from "~/application/use-cases/habit/interface";
import type { HabitController } from "~/interface-adapters/controllers/habit-controller";

export const TYPES = {
  DashboardRepository: Symbol.for(
    "DashboardRepository"
  ) as InjectionToken<IDashboardRepository>,
  DashboardUseCase: Symbol.for(
    "DashboardUseCase"
  ) as InjectionToken<IDashboardUseCase>,
  StreakCalculationService: Symbol.for(
    "StreakCalculationService"
  ) as InjectionToken<IStreakCalculationService>,
  HabitCompletionService: Symbol.for(
    "HabitCompletionService"
  ) as InjectionToken<IHabitCompletionService>,
  HabitArchiveService: Symbol.for(
    "HabitArchiveService"
  ) as InjectionToken<IHabitArchiveService>,
  HabitRepository: Symbol.for(
    "HabitRepository"
  ) as InjectionToken<IHabitRepository>,
  HabitLogRepository: Symbol.for(
    "HabitLogRepository"
  ) as InjectionToken<IHabitLogRepository>,
  AuthService: Symbol.for("AuthService") as InjectionToken<AuthService>,
  HabitUseCase: Symbol.for("HabitUseCase") as InjectionToken<IHabitUseCase>,
  HabitController: Symbol.for(
    "HabitController"
  ) as InjectionToken<HabitController>,
} as const;
