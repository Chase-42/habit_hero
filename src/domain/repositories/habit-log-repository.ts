import { type HabitLog } from "../entities/habit-log";

export interface IHabitLogRepository {
  /**
   * Create a new habit log
   */
  create(log: HabitLog): Promise<HabitLog>;

  /**
   * Update an existing habit log
   */
  update(log: HabitLog): Promise<HabitLog>;

  /**
   * Delete a habit log by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Find a habit log by ID
   */
  findById(id: string): Promise<HabitLog | null>;

  /**
   * Find all logs for a habit
   */
  findByHabitId(habitId: string): Promise<HabitLog[]>;

  /**
   * Find all logs for a user
   */
  findByUserId(userId: string): Promise<HabitLog[]>;

  /**
   * Find logs by date range
   */
  findByDateRange(params: {
    habitId: string;
    startDate: Date;
    endDate: Date;
  }): Promise<HabitLog[]>;

  /**
   * Delete all logs for a habit
   */
  deleteByHabitId(habitId: string): Promise<void>;

  /**
   * Execute a function within a transaction
   */
  withTransaction<T>(fn: () => Promise<T>): Promise<T>;
}
