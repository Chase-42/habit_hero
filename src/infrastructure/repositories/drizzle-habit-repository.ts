import { injectable, inject } from "tsyringe";
import { db } from "~/infrastructure/database/db";
import { habits } from "~/infrastructure/database/schema";
import { eq, and, type SQL } from "drizzle-orm";
import type { IHabitRepository } from "~/domain/repositories/habit-repository";
import type { IHabitLogRepository } from "~/domain/repositories/habit-log-repository";
import { Habit as DomainHabit } from "~/domain/entities/habit";
import type { HabitCategory } from "~/types/common/enums";
import {
  toDomainHabit,
  toDbHabit,
} from "~/infrastructure/type-converters/habit-converter";
import { DatabaseError } from "~/domain/errors/database-error";
import { logger } from "~/infrastructure/logger";
import type { IStreakCalculationService } from "~/domain/services/interfaces/streak-calculation-service.interface";
import type { IHabitCompletionService } from "~/domain/services/interfaces/habit-completion-service.interface";
import type { IHabitArchiveService } from "~/domain/services/interfaces/habit-archive-service.interface";
import { TYPES } from "~/di/tokens";

@injectable()
export class DrizzleHabitRepository implements IHabitRepository {
  constructor(
    @inject(TYPES.StreakCalculationService)
    private readonly streakCalculationService: IStreakCalculationService,
    @inject(TYPES.HabitLogRepository)
    private readonly habitLogRepository: IHabitLogRepository,
    @inject(TYPES.HabitCompletionService)
    private readonly habitCompletionService: IHabitCompletionService,
    @inject(TYPES.HabitArchiveService)
    private readonly habitArchiveService: IHabitArchiveService
  ) {}

  async create(habit: DomainHabit): Promise<DomainHabit> {
    try {
      const dbHabit = toDbHabit(habit);

      await db.insert(habits).values(dbHabit);

      const [created] = await db
        .select()
        .from(habits)
        .where(eq(habits.id, habit.id));

      if (!created) {
        throw new DatabaseError("Failed to create habit");
      }

      return toDomainHabit(created);
    } catch (error) {
      logger.error("Failed to create habit", { error, habitId: habit.id });
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError("Failed to create habit");
    }
  }

  async update(habit: DomainHabit): Promise<DomainHabit> {
    try {
      const dbHabit = toDbHabit(habit);

      await db
        .update(habits)
        .set({
          ...dbHabit,
          updatedAt: new Date(),
        })
        .where(eq(habits.id, habit.id));

      const [updated] = await db
        .select()
        .from(habits)
        .where(eq(habits.id, habit.id));

      if (!updated) {
        throw new DatabaseError("Failed to update habit");
      }

      return toDomainHabit(updated);
    } catch (error) {
      logger.error("Failed to update habit", { error, habitId: habit.id });
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError("Failed to update habit");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await db.delete(habits).where(eq(habits.id, id));
    } catch (error) {
      logger.error("Failed to delete habit", { error, habitId: id });
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError("Failed to delete habit");
    }
  }

  async findById(id: string): Promise<DomainHabit | null> {
    try {
      const [habit] = await db.select().from(habits).where(eq(habits.id, id));
      return habit ? toDomainHabit(habit) : null;
    } catch (error) {
      logger.error("Failed to find habit by id", { error, habitId: id });
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError("Failed to find habit by id");
    }
  }

  async findByUserId(userId: string): Promise<DomainHabit[]> {
    try {
      const dbHabits = await db
        .select()
        .from(habits)
        .where(eq(habits.userId, userId));

      return dbHabits.map(toDomainHabit);
    } catch (error) {
      logger.error("Failed to find habits by user id", { error, userId });
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError("Failed to find habits by user id");
    }
  }

  async findByFilters(filters: {
    userId: string;
    isActive?: boolean;
    isArchived?: boolean;
    category?: HabitCategory;
    searchQuery?: string;
  }): Promise<DomainHabit[]> {
    try {
      const conditions: SQL[] = [eq(habits.userId, filters.userId)];

      if (filters.isActive !== undefined) {
        conditions.push(eq(habits.isActive, filters.isActive));
      }

      if (filters.isArchived !== undefined) {
        conditions.push(eq(habits.isArchived, filters.isArchived));
      }

      if (filters.category !== undefined) {
        conditions.push(eq(habits.category, filters.category));
      }

      const dbHabits = await db
        .select()
        .from(habits)
        .where(and(...conditions));

      return dbHabits.map(toDomainHabit);
    } catch (error) {
      logger.error("Failed to find habits by filters", { error, filters });
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError("Failed to find habits by filters");
    }
  }

  async withTransaction<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await db.transaction(fn);
    } catch (error) {
      logger.error("Failed to execute transaction", { error });
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError("Failed to execute transaction");
    }
  }

  async updateStreak(params: {
    id: string;
    streak: number;
    longestStreak: number;
  }): Promise<void> {
    try {
      await db
        .update(habits)
        .set({
          streak: params.streak,
          longestStreak: params.longestStreak,
          updatedAt: new Date(),
        })
        .where(eq(habits.id, params.id));
    } catch (error) {
      logger.error("Failed to update streak", { error, habitId: params.id });
      throw new DatabaseError("Failed to update streak");
    }
  }

  async markAsCompleted(params: {
    id: string;
    completedAt: Date;
    notes?: string;
  }): Promise<void> {
    try {
      const habit = await this.findById(params.id);
      if (!habit) {
        throw new DatabaseError("Habit not found");
      }

      // Get the most recent log to check if the habit was completed on time
      const logs = await this.habitLogRepository.findByHabitId(params.id);
      const lastLog = logs[logs.length - 1];
      const lastCompletionDate = lastLog?.completedAt ?? habit.createdAt;

      // Check if the habit was completed on time
      const wasOnTime = this.habitCompletionService.wasHabitCompletedOnTime(
        habit,
        params.completedAt,
        lastCompletionDate
      );

      // Complete the habit
      const completedHabit = this.habitCompletionService.completeHabit(
        habit,
        params.completedAt,
        params.notes
      );

      // Create a new habit log
      const habitLog = this.habitCompletionService.createHabitLog(
        completedHabit,
        params.completedAt,
        params.notes
      );

      // Update the habit's streak
      const currentStreak =
        this.streakCalculationService.calculateCurrentStreak(completedHabit, [
          ...logs,
          habitLog,
        ]);
      const longestStreak =
        this.streakCalculationService.calculateLongestStreak(completedHabit, [
          ...logs,
          habitLog,
        ]);

      // Save everything in a transaction
      await this.withTransaction(async () => {
        // Update the habit
        await this.update(completedHabit);

        // Update the streak
        await this.updateStreak({
          id: params.id,
          streak: currentStreak,
          longestStreak,
        });

        // Create the habit log
        await this.habitLogRepository.create(habitLog);
      });
    } catch (error) {
      logger.error("Failed to mark habit as completed", {
        error,
        habitId: params.id,
      });
      throw new DatabaseError("Failed to mark habit as completed");
    }
  }

  async markAsArchived(id: string): Promise<void> {
    try {
      const habit = await this.findById(id);
      if (!habit) {
        throw new DatabaseError("Habit not found");
      }

      // Use the archive service to handle the business logic
      const archivedHabit = this.habitArchiveService.archiveHabit(habit);

      // Update the habit in the database
      await this.update(archivedHabit);
    } catch (error) {
      logger.error("Failed to mark habit as archived", { error, habitId: id });
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError("Failed to mark habit as archived");
    }
  }

  async markAsUnarchived(id: string): Promise<void> {
    try {
      const habit = await this.findById(id);
      if (!habit) {
        throw new DatabaseError("Habit not found");
      }

      // Use the archive service to handle the business logic
      const unarchivedHabit = this.habitArchiveService.unarchiveHabit(habit);

      // Update the habit in the database
      await this.update(unarchivedHabit);
    } catch (error) {
      logger.error("Failed to mark habit as unarchived", {
        error,
        habitId: id,
      });
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError("Failed to mark habit as unarchived");
    }
  }
}
