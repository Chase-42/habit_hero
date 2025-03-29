import { injectable } from "tsyringe";
import { db } from "~/infrastructure/database";
import { habit_logs_table } from "~/infrastructure/database/schema";
import type { IHabitLogRepository } from "~/application/interfaces/repositories/habit-log-repository.interface";
import type { Result } from "~/application/types";
import type {
  HabitLog,
  CompletionSummary,
  StreakSummary,
} from "~/entities/models/habit-log";
import { ValidationError, NotFoundError } from "~/entities/errors";
import { eq, and, gte, lte } from "drizzle-orm";
import {
  transformToDBHabitLog,
  transformFromDBHabitLog,
} from "~/entities/models/habit-log";

@injectable()
export class DrizzleHabitLogRepository implements IHabitLogRepository {
  async create(
    log: Omit<HabitLog, "id" | "createdAt" | "updatedAt">
  ): Promise<Result<HabitLog, ValidationError>> {
    try {
      const logId = crypto.randomUUID();
      const dbLog = transformToDBHabitLog({
        ...log,
        id: logId,
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
          error: new ValidationError("Failed to create habit log"),
        };
      }

      return {
        ok: true,
        value: transformFromDBHabitLog(newLog),
      };
    } catch (error) {
      return {
        ok: false,
        error: new ValidationError("Failed to create habit log"),
      };
    }
  }

  async findById(id: string): Promise<Result<HabitLog, NotFoundError>> {
    try {
      const [log] = await db
        .select()
        .from(habit_logs_table)
        .where(eq(habit_logs_table.id, id))
        .limit(1);

      if (!log) {
        return {
          ok: false,
          error: new NotFoundError("HabitLog", id),
        };
      }

      return {
        ok: true,
        value: transformFromDBHabitLog(log),
      };
    } catch (error) {
      return {
        ok: false,
        error: new NotFoundError("HabitLog", id),
      };
    }
  }

  async findByHabitId(
    habitId: string
  ): Promise<Result<HabitLog[], NotFoundError>> {
    try {
      const logs = await db
        .select()
        .from(habit_logs_table)
        .where(eq(habit_logs_table.habitId, habitId));

      if (!logs.length) {
        return {
          ok: false,
          error: new NotFoundError("HabitLog", habitId),
        };
      }

      return {
        ok: true,
        value: logs.map(transformFromDBHabitLog),
      };
    } catch (error) {
      return {
        ok: false,
        error: new NotFoundError("HabitLog", habitId),
      };
    }
  }

  async findByUserId(
    userId: string
  ): Promise<Result<HabitLog[], NotFoundError>> {
    try {
      const logs = await db
        .select()
        .from(habit_logs_table)
        .where(eq(habit_logs_table.userId, userId));

      if (!logs.length) {
        return {
          ok: false,
          error: new NotFoundError("HabitLog", userId),
        };
      }

      return {
        ok: true,
        value: logs.map(transformFromDBHabitLog),
      };
    } catch (error) {
      return {
        ok: false,
        error: new NotFoundError("HabitLog", userId),
      };
    }
  }

  async update(
    id: string,
    log: Partial<Omit<HabitLog, "id" | "createdAt" | "updatedAt">>
  ): Promise<Result<HabitLog, ValidationError | NotFoundError>> {
    try {
      const [existingLog] = await db
        .select()
        .from(habit_logs_table)
        .where(eq(habit_logs_table.id, id))
        .limit(1);

      if (!existingLog) {
        return {
          ok: false,
          error: new NotFoundError("HabitLog", id),
        };
      }

      const dbLog = transformToDBHabitLog({
        ...existingLog,
        ...log,
        updatedAt: new Date(),
      } as HabitLog);

      await db
        .update(habit_logs_table)
        .set(dbLog)
        .where(eq(habit_logs_table.id, id));

      const [updatedLog] = await db
        .select()
        .from(habit_logs_table)
        .where(eq(habit_logs_table.id, id))
        .limit(1);

      if (!updatedLog) {
        return {
          ok: false,
          error: new ValidationError("Failed to update habit log"),
        };
      }

      return {
        ok: true,
        value: transformFromDBHabitLog(updatedLog),
      };
    } catch (error) {
      return {
        ok: false,
        error: new ValidationError("Failed to update habit log"),
      };
    }
  }

  async findByDateRange(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<HabitLog[], ValidationError>> {
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

  async delete(id: string): Promise<Result<void, NotFoundError>> {
    try {
      // First check if the log exists
      const [existingLog] = await db
        .select()
        .from(habit_logs_table)
        .where(eq(habit_logs_table.id, id))
        .limit(1);

      if (!existingLog) {
        return {
          ok: false,
          error: new NotFoundError("HabitLog", id),
        };
      }

      // Delete the log
      await db.delete(habit_logs_table).where(eq(habit_logs_table.id, id));

      return {
        ok: true,
        value: undefined,
      };
    } catch (error) {
      return {
        ok: false,
        error: new NotFoundError("HabitLog", id),
      };
    }
  }

  async exists(id: string): Promise<Result<boolean, NotFoundError>> {
    try {
      const [log] = await db
        .select()
        .from(habit_logs_table)
        .where(eq(habit_logs_table.id, id))
        .limit(1);

      return {
        ok: true,
        value: !!log,
      };
    } catch (error) {
      return {
        ok: false,
        error: new NotFoundError("HabitLog", id),
      };
    }
  }

  async isOwnedBy(
    id: string,
    userId: string
  ): Promise<Result<boolean, NotFoundError>> {
    try {
      const [log] = await db
        .select()
        .from(habit_logs_table)
        .where(eq(habit_logs_table.id, id))
        .limit(1);

      if (!log) {
        return {
          ok: false,
          error: new NotFoundError("HabitLog", id),
        };
      }

      return {
        ok: true,
        value: log.userId === userId,
      };
    } catch (error) {
      return {
        ok: false,
        error: new NotFoundError("HabitLog", id),
      };
    }
  }

  async getCompletionSummaries(
    habitId: string,
    startDate: Date,
    endDate: Date,
    groupBy?: "day" | "week" | "month"
  ): Promise<Result<CompletionSummary[], ValidationError | NotFoundError>> {
    // TODO: Implement analytics methods
    return {
      ok: false,
      error: new ValidationError("Analytics methods not implemented"),
    };
  }

  async getStreakSummaries(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<StreakSummary[], ValidationError | NotFoundError>> {
    // TODO: Implement analytics methods
    return {
      ok: false,
      error: new ValidationError("Analytics methods not implemented"),
    };
  }

  async getCompletionRate(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<number, ValidationError | NotFoundError>> {
    // TODO: Implement analytics methods
    return {
      ok: false,
      error: new ValidationError("Analytics methods not implemented"),
    };
  }

  async getAverageDifficulty(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<number, ValidationError | NotFoundError>> {
    // TODO: Implement analytics methods
    return {
      ok: false,
      error: new ValidationError("Analytics methods not implemented"),
    };
  }
}
