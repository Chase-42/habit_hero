import { injectable } from "tsyringe";
import { db } from "~/infrastructure/database/db";
import { habitLogs } from "~/infrastructure/database/schema";
import { eq, and, gte, lte, type SQL } from "drizzle-orm";
import type { IHabitLogRepository } from "~/domain/repositories/habit-log-repository";
import { HabitLog as DomainHabitLog } from "~/domain/entities/habit-log";
import {
  toDomainHabitLog,
  toDbHabitLog,
} from "~/infrastructure/type-converters/habit-log-converter";
import { DatabaseError } from "~/domain/errors/database-error";
import { logger } from "~/infrastructure/logger";

@injectable()
export class DrizzleHabitLogRepository implements IHabitLogRepository {
  async create(habitLog: DomainHabitLog): Promise<DomainHabitLog> {
    try {
      const dbHabitLog = toDbHabitLog(habitLog);

      await db.insert(habitLogs).values(dbHabitLog);

      const [created] = await db
        .select()
        .from(habitLogs)
        .where(eq(habitLogs.id, habitLog.id));

      if (!created) {
        throw new DatabaseError("Failed to create habit log");
      }

      return toDomainHabitLog(created);
    } catch (error) {
      logger.error("Failed to create habit log", { error, logId: habitLog.id });
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError("Failed to create habit log");
    }
  }

  async update(habitLog: DomainHabitLog): Promise<DomainHabitLog> {
    try {
      const dbHabitLog = toDbHabitLog(habitLog);

      await db
        .update(habitLogs)
        .set({
          ...dbHabitLog,
          updatedAt: new Date(),
        })
        .where(eq(habitLogs.id, habitLog.id));

      const [updated] = await db
        .select()
        .from(habitLogs)
        .where(eq(habitLogs.id, habitLog.id));

      if (!updated) {
        throw new DatabaseError("Failed to update habit log");
      }

      return toDomainHabitLog(updated);
    } catch (error) {
      logger.error("Failed to update habit log", { error, logId: habitLog.id });
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError("Failed to update habit log");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await db.delete(habitLogs).where(eq(habitLogs.id, id));
    } catch (error) {
      logger.error("Failed to delete habit log", { error, logId: id });
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError("Failed to delete habit log");
    }
  }

  async findById(id: string): Promise<DomainHabitLog | null> {
    try {
      const [habitLog] = await db
        .select()
        .from(habitLogs)
        .where(eq(habitLogs.id, id));

      return habitLog ? toDomainHabitLog(habitLog) : null;
    } catch (error) {
      logger.error("Failed to find habit log by id", { error, logId: id });
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError("Failed to find habit log by id");
    }
  }

  async findByHabitId(habitId: string): Promise<DomainHabitLog[]> {
    try {
      const dbHabitLogs = await db
        .select()
        .from(habitLogs)
        .where(eq(habitLogs.habitId, habitId));

      return dbHabitLogs.map(toDomainHabitLog);
    } catch (error) {
      logger.error("Failed to find habit logs by habit id", { error, habitId });
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError("Failed to find habit logs by habit id");
    }
  }

  async findByUserId(userId: string): Promise<DomainHabitLog[]> {
    try {
      const dbHabitLogs = await db
        .select()
        .from(habitLogs)
        .where(eq(habitLogs.userId, userId));

      return dbHabitLogs.map(toDomainHabitLog);
    } catch (error) {
      logger.error("Failed to find habit logs by user id", { error, userId });
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError("Failed to find habit logs by user id");
    }
  }

  async findByDateRange(params: {
    habitId: string;
    startDate: Date;
    endDate: Date;
  }): Promise<DomainHabitLog[]> {
    try {
      const dbHabitLogs = await db
        .select()
        .from(habitLogs)
        .where(
          and(
            eq(habitLogs.habitId, params.habitId),
            gte(habitLogs.completedAt, params.startDate),
            lte(habitLogs.completedAt, params.endDate)
          )
        );

      return dbHabitLogs.map(toDomainHabitLog);
    } catch (error) {
      logger.error("Failed to find habit logs by date range", {
        error,
        params,
      });
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError("Failed to find habit logs by date range");
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

  async deleteByHabitId(habitId: string): Promise<void> {
    try {
      await db.delete(habitLogs).where(eq(habitLogs.habitId, habitId));
    } catch (error) {
      logger.error("Failed to delete habit logs by habit id", {
        error,
        habitId,
      });
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError("Failed to delete habit logs by habit id");
    }
  }
}
