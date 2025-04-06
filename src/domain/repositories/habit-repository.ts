import { type Habit } from "../entities/habit";

export interface IHabitRepository {
  /**
   * Create a new habit
   */
  create(habit: Habit): Promise<Habit>;

  /**
   * Update an existing habit
   */
  update(habit: Habit): Promise<Habit>;

  /**
   * Delete a habit by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Find a habit by ID
   */
  findById(id: string): Promise<Habit | null>;

  /**
   * Find all habits for a user
   */
  findByUserId(userId: string): Promise<Habit[]>;

  /**
   * Find habits by filters
   */
  findByFilters(filters: {
    userId: string;
    isActive?: boolean;
    isArchived?: boolean;
    category?: string;
    searchQuery?: string;
  }): Promise<Habit[]>;

  /**
   * Update a habit's streak
   */
  updateStreak(params: {
    id: string;
    streak: number;
    longestStreak: number;
  }): Promise<void>;

  /**
   * Mark a habit as completed
   */
  markAsCompleted(params: {
    id: string;
    completedAt: Date;
    notes?: string;
  }): Promise<void>;

  /**
   * Mark a habit as archived
   */
  markAsArchived(id: string): Promise<void>;

  /**
   * Mark a habit as unarchived
   */
  markAsUnarchived(id: string): Promise<void>;

  /**
   * Execute a function within a transaction
   */
  withTransaction<T>(fn: () => Promise<T>): Promise<T>;
}
