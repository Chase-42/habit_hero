import { injectable } from "tsyringe";
import { db } from "~/infrastructure/database";
import {
  habits_table,
  habit_logs_table,
} from "~/infrastructure/database/schema";
import type { IHabitRepository } from "~/application/interfaces/repositories/habit-repository.interface";
import type { Result } from "~/application/types";
import type { Habit, HabitFilters } from "~/entities/models/habit";
import type { HabitLog } from "~/entities/models/habit-log";
import { ValidationError, NotFoundError } from "~/entities/errors";
import { eq, and, gte, lte } from "drizzle-orm";
import {
  transformToDBHabit,
  transformFromDBHabit,
  serializeFrequencyValue,
} from "~/entities/models/habit";
import {
  transformToDBHabitLog,
  transformFromDBHabitLog,
} from "~/entities/models/habit-log";

@injectable()
export class DrizzleHabitRepository implements IHabitRepository {
  async findById(id: string): Promise<Result<Habit, NotFoundError>> {
    try {
      const [habit] = await db
        .select()
        .from(habits_table)
        .where(eq(habits_table.id, id))
        .limit(1);

      if (!habit) {
        return {
          ok: false,
          error: new NotFoundError("Habit", id),
        };
      }

      return {
        ok: true,
        value: transformFromDBHabit(habit),
      };
    } catch (error) {
      return {
        ok: false,
        error: new NotFoundError("Habit", id),
      };
    }
  }

  async findByUserId(
    userId: string,
    filters?: HabitFilters
  ): Promise<Result<Habit[], ValidationError>> {
    try {
      const habits = await db
        .select()
        .from(habits_table)
        .where(eq(habits_table.userId, userId));

      return {
        ok: true,
        value: habits.map(transformFromDBHabit),
      };
    } catch (error) {
      return {
        ok: false,
        error: new ValidationError("Failed to fetch habits"),
      };
    }
  }

  async create(
    habit: Omit<
      Habit,
      "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
    >
  ): Promise<Result<Habit, ValidationError>> {
    try {
      const habitId = crypto.randomUUID();
      const dbHabit = transformToDBHabit({
        ...habit,
        id: habitId,
        streak: 0,
        longestStreak: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Habit);

      await db.insert(habits_table).values(dbHabit);

      const [newHabit] = await db
        .select()
        .from(habits_table)
        .where(eq(habits_table.id, habitId))
        .limit(1);

      if (!newHabit) {
        return {
          ok: false,
          error: new ValidationError("Failed to create habit"),
        };
      }

      return {
        ok: true,
        value: transformFromDBHabit(newHabit),
      };
    } catch (error) {
      return {
        ok: false,
        error: new ValidationError("Failed to create habit"),
      };
    }
  }

  async update(
    id: string,
    habit: Partial<Omit<Habit, "id" | "createdAt" | "updatedAt">>
  ): Promise<Result<Habit, ValidationError | NotFoundError>> {
    try {
      const dbHabit = transformToDBHabit({
        ...habit,
        id,
        updatedAt: new Date(),
      } as Habit);

      await db.update(habits_table).set(dbHabit).where(eq(habits_table.id, id));

      const [updatedHabit] = await db
        .select()
        .from(habits_table)
        .where(eq(habits_table.id, id))
        .limit(1);

      if (!updatedHabit) {
        return {
          ok: false,
          error: new NotFoundError("Habit", id),
        };
      }

      return {
        ok: true,
        value: transformFromDBHabit(updatedHabit),
      };
    } catch (error) {
      return {
        ok: false,
        error: new ValidationError("Failed to update habit"),
      };
    }
  }

  async delete(id: string): Promise<Result<void, NotFoundError>> {
    try {
      // First check if the habit exists
      const [existingHabit] = await db
        .select()
        .from(habits_table)
        .where(eq(habits_table.id, id))
        .limit(1);

      if (!existingHabit) {
        return {
          ok: false,
          error: new NotFoundError("Habit", id),
        };
      }

      // Delete the habit
      await db.delete(habits_table).where(eq(habits_table.id, id));

      return {
        ok: true,
        value: undefined,
      };
    } catch (error) {
      return {
        ok: false,
        error: new NotFoundError("Habit", id),
      };
    }
  }

  async addLog(
    id: string,
    log: Omit<HabitLog, "id" | "habitId" | "createdAt" | "updatedAt">
  ): Promise<Result<HabitLog, ValidationError | NotFoundError>> {
    try {
      const logId = crypto.randomUUID();
      const dbLog = transformToDBHabitLog({
        ...log,
        id: logId,
        habitId: id,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as HabitLog);

      await db.insert(habit_logs_table).values(dbLog);

      const [newLog] = await db
        .select()
        .from(habit_logs_table)
        .where(eq(habit_logs_table.id, logId))
        .limit(1);

      if (!newLog) {
        return {
          ok: false,
          error: new ValidationError("Failed to add habit log"),
        };
      }

      return {
        ok: true,
        value: transformFromDBHabitLog(newLog),
      };
    } catch (error) {
      return {
        ok: false,
        error: new ValidationError("Failed to add habit log"),
      };
    }
  }

  async getLogs(
    habitId: string
  ): Promise<Result<HabitLog[], ValidationError | NotFoundError>> {
    try {
      const logs = await db
        .select()
        .from(habit_logs_table)
        .where(eq(habit_logs_table.habitId, habitId));

      return {
        ok: true,
        value: logs.map(transformFromDBHabitLog),
      };
    } catch (error) {
      return {
        ok: false,
        error: new ValidationError("Failed to fetch habit logs"),
      };
    }
  }

  async getLogsByDateRange(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<HabitLog[], ValidationError | NotFoundError>> {
    try {
      const logs = await db
        .select()
        .from(habit_logs_table)
        .where(
          and(
            eq(habit_logs_table.habitId, habitId),
            gte(habit_logs_table.completedAt, startDate),
            lte(habit_logs_table.completedAt, endDate)
          )
        );

      return {
        ok: true,
        value: logs.map(transformFromDBHabitLog),
      };
    } catch (error) {
      return {
        ok: false,
        error: new ValidationError("Failed to fetch habit logs by date range"),
      };
    }
  }
}
