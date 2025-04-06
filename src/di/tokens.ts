/**
 * Dependency injection tokens for the application.
 * These tokens are used to register and resolve dependencies in the container.
 */
export const TYPES = {
  // Repositories
  HabitRepository: Symbol.for("HabitRepository"),
  HabitLogRepository: Symbol.for("HabitLogRepository"),
  StreakRepository: Symbol.for("StreakRepository"),

  // Services
  AuthService: Symbol.for("AuthService"),
  NotificationService: Symbol.for("NotificationService"),
  StreakCalculationService: Symbol.for("StreakCalculationService"),
  HabitCompletionService: Symbol.for("HabitCompletionService"),
  HabitArchiveService: Symbol.for("HabitArchiveService"),

  // Use Cases
  HabitUseCase: Symbol.for("HabitUseCase"),

  // Controllers
  HabitController: Symbol.for("HabitController"),
} as const;
