export class HabitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HabitError";
  }
}

export class HabitNotFoundError extends HabitError {
  constructor(habitId: string) {
    super(`Habit with ID ${habitId} not found`);
    this.name = "HabitNotFoundError";
  }
}

export class HabitValidationError extends HabitError {
  constructor(message: string) {
    super(message);
    this.name = "HabitValidationError";
  }
}

export class UnauthorizedHabitAccessError extends HabitError {
  constructor(habitId: string, userId: string) {
    super(`User ${userId} is not authorized to access habit ${habitId}`);
    this.name = "UnauthorizedHabitAccessError";
  }
}
