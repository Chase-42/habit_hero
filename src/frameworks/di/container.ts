import { container } from "tsyringe";
import { HabitService } from "~/infrastructure/services/habit-service";
import { FetchClient } from "~/infrastructure/http/fetch-client";
import type { IHabitService } from "~/application/interfaces/habit-service";
import type { IHttpClient } from "~/application/interfaces/http-client";
import { HabitLogController } from "~/interface-adapters/controllers/habit-log.controller";
import { AddHabitLogUseCase } from "~/application/use-cases/add-habit-log.use-case";
import { GetHabitLogsUseCase } from "~/application/use-cases/get-habit-logs.use-case";
import { DeleteHabitLogUseCase } from "~/application/use-cases/delete-habit-log.use-case";
import { GetHabitAnalyticsUseCase } from "~/application/use-cases/get-habit-analytics.use-case";
import { DrizzleHabitRepository } from "~/infrastructure/repositories/drizzle-habit.repository";
import { DrizzleHabitLogRepository } from "~/infrastructure/repositories/drizzle-habit-log.repository";
import type { IHabitRepository } from "~/application/interfaces/repositories/habit-repository.interface";
import type { IHabitLogRepository } from "~/application/interfaces/repositories/habit-log-repository.interface";

// Register services
container.register<IHttpClient>("IHttpClient", {
  useClass: FetchClient,
});

container.register<IHabitService>("IHabitService", {
  useClass: HabitService,
});

// Register repositories
container.register<IHabitRepository>("IHabitRepository", {
  useClass: DrizzleHabitRepository,
});

container.register<IHabitLogRepository>("IHabitLogRepository", {
  useClass: DrizzleHabitLogRepository,
});

// Register use cases
container.register<AddHabitLogUseCase>("AddHabitLogUseCase", {
  useClass: AddHabitLogUseCase,
});

container.register<GetHabitLogsUseCase>("GetHabitLogsUseCase", {
  useClass: GetHabitLogsUseCase,
});

container.register<DeleteHabitLogUseCase>("DeleteHabitLogUseCase", {
  useClass: DeleteHabitLogUseCase,
});

container.register<GetHabitAnalyticsUseCase>("GetHabitAnalyticsUseCase", {
  useClass: GetHabitAnalyticsUseCase,
});

// Register controllers
container.register<HabitLogController>("HabitLogController", {
  useClass: HabitLogController,
});

export { container };
