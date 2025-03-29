import { eq, like, and, type SQL } from "drizzle-orm";
import type {
  Habit,
  CreateHabit,
  UpdateHabit,
  HabitFilters,
  HabitCategory,
  FrequencyValue,
  FrequencyType,
} from "~/entities/models/habit";
import type { HabitLog } from "~/entities/models/habit-log";
import type { IHabitRepository } from "~/application/interfaces/repositories/habit-repository";
import { db } from "../database";
import { habits_table, habit_logs_table } from "../database/schema";
import { ValidationError, NotFoundError } from "~/entities/errors";
import { Result, ok, err } from "~/application/types";
import { injectable } from "tsyringe";
import { CreateHabitSchema, HabitSchema } from "~/entities/models/habit";
import { z } from "zod";
import {
  transformToDBHabit,
  transformFromDBHabit,
} from "~/entities/models/habit";
import {
  transformToDBHabitLog,
  transformFromDBHabitLog,
} from "~/entities/models/habit-log";
import {
  serializeFrequencyValue,
  deserializeFrequencyValue,
} from "../database/types";
import type { DB_HabitRow } from "../database/types";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class HabitRepository implements IHabitRepository {
  async findById(id: string): Promise<Result<Habit, NotFoundError>> {
    try {
      const result = await db
        .select()
        .from(habits_table)
        .where(eq(habits_table.id, id))
        .limit(1);

      const dbHabit = result[0];
      if (!dbHabit) {
        return err(new NotFoundError("Habit", id));
      }

      const habit = transformFromDBHabit(dbHabit);
      return ok(habit);
    } catch (error) {
      return err(new NotFoundError("Habit", id));
    }
  }

  async findByUserId(userId: string): Promise<Result<Habit[], NotFoundError>> {
    try {
      const result = await db
        .select()
        .from(habits_table)
        .where(eq(habits_table.userId, userId));

      console.log("Raw habits from DB:", JSON.stringify(result, null, 2));
      const habits = result.map(transformFromDBHabit);
      return ok(habits);
    } catch (error) {
      console.error("Error fetching habits for user:", error);
      return err(new NotFoundError("Habits", userId));
    }
  }

  async findByCategory(
    userId: string,
    category: HabitCategory
  ): Promise<Result<Habit[], ValidationError>> {
    try {
      const result = await db
        .select()
        .from(habits_table)
        .where(
          and(
            eq(habits_table.userId, userId),
            eq(habits_table.category, category)
          )
        );

      const habits = result.map(transformFromDBHabit);
      return ok(habits);
    } catch (error) {
      return err(new ValidationError("Failed to fetch habits by category"));
    }
  }

  async findByStatus(
    userId: string,
    isCompleted: boolean
  ): Promise<Result<Habit[], ValidationError>> {
    try {
      const result = await db
        .select()
        .from(habits_table)
        .where(
          and(
            eq(habits_table.userId, userId),
            eq(habits_table.isCompleted, isCompleted)
          )
        );

      const habits = result.map(transformFromDBHabit);
      return ok(habits);
    } catch (error) {
      return err(new ValidationError("Failed to fetch habits by status"));
    }
  }

  async findByFilters(
    filters: HabitFilters
  ): Promise<Result<Habit[], ValidationError>> {
    try {
      const conditions: SQL[] = [eq(habits_table.userId, filters.userId)];

      if (filters.isActive !== undefined) {
        conditions.push(eq(habits_table.isActive, filters.isActive));
      }

      if (filters.isArchived !== undefined) {
        conditions.push(eq(habits_table.isArchived, filters.isArchived));
      }

      if (filters.category) {
        conditions.push(eq(habits_table.category, filters.category));
      }

      if (filters.searchQuery) {
        conditions.push(like(habits_table.title, `%${filters.searchQuery}%`));
      }

      const result = await db
        .select()
        .from(habits_table)
        .where(and(...conditions));

      const habits = result.map(transformFromDBHabit);
      return ok(habits);
    } catch (error) {
      console.error("Failed to find habits by filters:", error);
      return err(new ValidationError("Failed to find habits by filters"));
    }
  }

  async create(habit: CreateHabit): Promise<Result<Habit, ValidationError>> {
    try {
      // Generate a new ID and add required fields
      const now = new Date();
      const habitWithId: Habit = {
        ...habit,
        id: `habit_${uuidv4()}`,
        streak: 0,
        longestStreak: 0,
        createdAt: now,
        updatedAt: now,
        isCompleted: false,
        isActive: true,
        isArchived: false,
        lastCompleted: null,
        reminder: null,
        reminderEnabled: false,
      };

      // Validate the habit before transforming
      const validatedHabit = HabitSchema.parse(habitWithId);
      const dbHabit = transformToDBHabit(validatedHabit);

      await db.insert(habits_table).values(dbHabit);

      return ok(validatedHabit);
    } catch (error) {
      console.error("Error creating habit:", error);
      if (error instanceof z.ZodError) {
        return err(
          new ValidationError(error.errors.map((e) => e.message).join(", "))
        );
      }
      return err(
        new ValidationError(
          error instanceof Error ? error.message : "Failed to create habit"
        )
      );
    }
  }

  async update(
    id: string,
    data: UpdateHabit
  ): Promise<Result<Habit, ValidationError | NotFoundError>> {
    try {
      const habit = await this.findById(id);
      if (!habit.ok) {
        return err(new NotFoundError("Habit", id));
      }

      const updatedHabit: Habit = {
        ...habit.value,
        ...data,
        id,
        updatedAt: new Date(),
      };

      const dbHabit = transformToDBHabit(updatedHabit);
      await db.update(habits_table).set(dbHabit).where(eq(habits_table.id, id));

      return ok(updatedHabit);
    } catch (error) {
      return err(new ValidationError("Failed to update habit"));
    }
  }

  async toggleStatus(
    id: string
  ): Promise<Result<Habit, ValidationError | NotFoundError>> {
    try {
      const habit = await this.findById(id);
      if (!habit.ok) {
        return err(new NotFoundError("Habit", id));
      }

      const updatedHabit: Habit = {
        ...habit.value,
        isCompleted: !habit.value.isCompleted,
        updatedAt: new Date(),
      };

      const dbHabit = transformToDBHabit(updatedHabit);
      await db.update(habits_table).set(dbHabit).where(eq(habits_table.id, id));

      return ok(updatedHabit);
    } catch (error) {
      return err(new ValidationError("Failed to toggle habit status"));
    }
  }

  async updateStreak(
    id: string,
    streak: number,
    longestStreak: number
  ): Promise<Result<Habit, ValidationError | NotFoundError>> {
    try {
      const habit = await this.findById(id);
      if (!habit.ok) {
        return err(new NotFoundError("Habit", id));
      }

      const updatedHabit: Habit = {
        ...habit.value,
        streak,
        longestStreak,
        updatedAt: new Date(),
      };

      const dbHabit = transformToDBHabit(updatedHabit);
      await db.update(habits_table).set(dbHabit).where(eq(habits_table.id, id));

      return ok(updatedHabit);
    } catch (error) {
      return err(new ValidationError("Failed to update habit streak"));
    }
  }

  async resetStreak(
    id: string
  ): Promise<Result<Habit, ValidationError | NotFoundError>> {
    try {
      const habit = await this.findById(id);
      if (!habit.ok) {
        return err(new NotFoundError("Habit", id));
      }

      const updatedHabit: Habit = {
        ...habit.value,
        streak: 0,
        updatedAt: new Date(),
      };

      const dbHabit = transformToDBHabit(updatedHabit);
      await db.update(habits_table).set(dbHabit).where(eq(habits_table.id, id));

      return ok(updatedHabit);
    } catch (error) {
      return err(new ValidationError("Failed to reset habit streak"));
    }
  }

  async archive(
    id: string
  ): Promise<Result<Habit, ValidationError | NotFoundError>> {
    try {
      const habit = await this.findById(id);
      if (!habit.ok) {
        return err(new NotFoundError("Habit", id));
      }

      const updatedHabit: Habit = {
        ...habit.value,
        isArchived: true,
        updatedAt: new Date(),
      };

      const dbHabit = transformToDBHabit(updatedHabit);
      await db.update(habits_table).set(dbHabit).where(eq(habits_table.id, id));

      return ok(updatedHabit);
    } catch (error) {
      return err(new ValidationError("Failed to archive habit"));
    }
  }

  async unarchive(
    id: string
  ): Promise<Result<Habit, ValidationError | NotFoundError>> {
    try {
      const habit = await this.findById(id);
      if (!habit.ok) {
        return err(new NotFoundError("Habit", id));
      }

      const updatedHabit: Habit = {
        ...habit.value,
        isArchived: false,
        updatedAt: new Date(),
      };

      const dbHabit = transformToDBHabit(updatedHabit);
      await db.update(habits_table).set(dbHabit).where(eq(habits_table.id, id));

      return ok(updatedHabit);
    } catch (error) {
      return err(new ValidationError("Failed to unarchive habit"));
    }
  }

  async markAsCompleted(
    id: string,
    completedAt: Date
  ): Promise<Result<Habit, ValidationError | NotFoundError>> {
    try {
      const habit = await this.findById(id);
      if (!habit.ok) {
        return err(new NotFoundError("Habit", id));
      }

      const updatedHabit: Habit = {
        ...habit.value,
        isCompleted: true,
        lastCompleted: completedAt,
        updatedAt: new Date(),
      };

      const dbHabit = transformToDBHabit(updatedHabit);
      await db.update(habits_table).set(dbHabit).where(eq(habits_table.id, id));

      return ok(updatedHabit);
    } catch (error) {
      return err(new ValidationError("Failed to mark habit as completed"));
    }
  }

  async markAsUncompleted(
    id: string
  ): Promise<Result<Habit, ValidationError | NotFoundError>> {
    try {
      const habit = await this.findById(id);
      if (!habit.ok) {
        return err(new NotFoundError("Habit", id));
      }

      const updatedHabit: Habit = {
        ...habit.value,
        isCompleted: false,
        lastCompleted: null,
        updatedAt: new Date(),
      };

      const dbHabit = transformToDBHabit(updatedHabit);
      await db.update(habits_table).set(dbHabit).where(eq(habits_table.id, id));

      return ok(updatedHabit);
    } catch (error) {
      return err(new ValidationError("Failed to mark habit as uncompleted"));
    }
  }

  async addLog(
    id: string,
    log: Omit<HabitLog, "id" | "habitId" | "createdAt" | "updatedAt">
  ): Promise<Result<HabitLog, ValidationError | NotFoundError>> {
    try {
      const habit = await this.findById(id);
      if (!habit.ok) {
        return err(new NotFoundError("Habit", id));
      }

      const newLogId = crypto.randomUUID();
      const now = new Date();

      const domainLog: HabitLog = {
        ...log,
        id: newLogId,
        habitId: id,
        createdAt: now,
        updatedAt: now,
      };

      const dbLog = transformToDBHabitLog(domainLog);
      await db.insert(habit_logs_table).values(dbLog);

      return ok(domainLog);
    } catch (error) {
      return err(new ValidationError("Failed to add habit log"));
    }
  }

  async getLogs(
    habitId: string
  ): Promise<Result<HabitLog[], ValidationError | NotFoundError>> {
    try {
      const habit = await this.findById(habitId);
      if (!habit.ok) {
        return err(new NotFoundError("Habit", habitId));
      }

      const result = await db
        .select()
        .from(habit_logs_table)
        .where(eq(habit_logs_table.habitId, habitId));

      const logs = result.map(transformFromDBHabitLog);
      return ok(logs);
    } catch (error) {
      return err(new ValidationError("Failed to fetch habit logs"));
    }
  }

  async getLogsByDateRange(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<HabitLog[], ValidationError | NotFoundError>> {
    try {
      const habit = await this.findById(habitId);
      if (!habit.ok) {
        return err(new NotFoundError("Habit", habitId));
      }

      const result = await db
        .select()
        .from(habit_logs_table)
        .where(
          and(
            eq(habit_logs_table.habitId, habitId),
            eq(habit_logs_table.completedAt, startDate),
            eq(habit_logs_table.completedAt, endDate)
          )
        );

      const logs = result.map(transformFromDBHabitLog);
      return ok(logs);
    } catch (error) {
      return err(
        new ValidationError("Failed to fetch habit logs by date range")
      );
    }
  }

  async deleteLog(
    logId: string
  ): Promise<Result<void, ValidationError | NotFoundError>> {
    try {
      const result = await db
        .delete(habit_logs_table)
        .where(eq(habit_logs_table.id, logId));

      if (!result) {
        return err(new NotFoundError("Habit Log", logId));
      }

      return ok(undefined);
    } catch (error) {
      return err(new ValidationError("Failed to delete habit log"));
    }
  }

  async exists(id: string): Promise<Result<boolean, NotFoundError>> {
    try {
      const result = await db
        .select()
        .from(habits_table)
        .where(eq(habits_table.id, id))
        .limit(1);

      return ok(result.length > 0);
    } catch (error) {
      return err(new NotFoundError("Habit", id));
    }
  }

  async delete(id: string): Promise<Result<void, NotFoundError>> {
    try {
      const exists = await this.exists(id);
      if (!exists.ok || !exists.value) {
        return err(new NotFoundError("Habit", id));
      }

      await db.delete(habits_table).where(eq(habits_table.id, id));
      return ok(undefined);
    } catch (error) {
      return err(new NotFoundError("Habit", id));
    }
  }

  async isOwnedBy(
    id: string,
    userId: string
  ): Promise<Result<boolean, NotFoundError>> {
    try {
      const result = await db
        .select({ id: habits_table.id })
        .from(habits_table)
        .where(and(eq(habits_table.id, id), eq(habits_table.userId, userId)))
        .limit(1);

      return ok(result.length > 0);
    } catch (error) {
      return err(new NotFoundError("Habit", id));
    }
  }
}
