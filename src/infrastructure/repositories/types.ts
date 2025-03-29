import type {
  Goal,
  Habit,
  HabitLog,
  CreateGoal,
  CreateHabit,
  CreateHabitLog,
  UpdateGoal,
  UpdateHabit,
  UpdateHabitLog,
} from "~/types";

// Base repository interface
export interface BaseRepository<T, CreateT, UpdateT> {
  findById(id: string): Promise<T | null>;
  findByUserId(userId: string): Promise<T[]>;
  create(data: CreateT): Promise<T>;
  update(id: string, data: UpdateT): Promise<T>;
  delete(id: string): Promise<void>;
}

// Goal repository interface
export interface GoalRepository
  extends BaseRepository<Goal, CreateGoal, UpdateGoal> {
  // Add any goal-specific methods here
}

// Habit repository interface
export interface HabitRepository
  extends BaseRepository<Habit, CreateHabit, UpdateHabit> {
  // Add any habit-specific methods here
  findByCategory(userId: string, category: Habit["category"]): Promise<Habit[]>;
  findByStatus(userId: string, isCompleted: boolean): Promise<Habit[]>;
  toggleStatus(id: string): Promise<Habit>;
}

// Habit Log repository interface
export interface HabitLogRepository
  extends BaseRepository<HabitLog, CreateHabitLog, UpdateHabitLog> {
  // Add any habit log-specific methods here
  findByHabitId(habitId: string): Promise<HabitLog[]>;
  findByDateRange(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<HabitLog[]>;
  getStreak(habitId: string): Promise<number>;
  getLongestStreak(habitId: string): Promise<number>;
}
