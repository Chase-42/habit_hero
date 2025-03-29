import { eq, and, between, desc, avg } from "drizzle-orm";
import type { IHabitLogRepository } from "~/application/interfaces/repositories/habit-log-repository";
import { db } from "../database";
import { habit_logs_table } from "../database/schema";
import { injectable } from "tsyringe";
import { NotFoundError, ValidationError } from "~/entities/errors";
import { Result, ok, err } from "~/application/types";
import type {
  HabitLog,
  CompletionSummary,
  StreakSummary,
} from "~/entities/types/habit-log";
import { HabitLogMapper } from "../mappers/habit-log.mapper";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class HabitLogRepository implements IHabitLogRepository {
  async findByUserId(
    userId: string
  ): Promise<Result<HabitLog[], NotFoundError>> {
    try {
      const result = await db
        .select()
        .from(habit_logs_table)
        .where(eq(habit_logs_table.userId, userId))
        .orderBy(desc(habit_logs_table.completedAt));

      const mappedLogs: HabitLog[] = [];
      for (const log of result) {
        const mappedResult = HabitLogMapper.toDomain(log);
        if (!mappedResult.ok) {
          return err(new NotFoundError("HabitLog", userId));
        }
        mappedLogs.push(mappedResult.value);
      }

      return ok(mappedLogs);
    } catch (error) {
      return err(new NotFoundError("HabitLog", userId));
    }
  }

  async findById(id: string): Promise<Result<HabitLog, NotFoundError>> {
    try {
      const result = await db
        .select()
        .from(habit_logs_table)
        .where(eq(habit_logs_table.id, id))
        .limit(1);

      const log = result[0];
      if (!log) {
        return err(new NotFoundError("HabitLog", id));
      }

      const domainResult = HabitLogMapper.toDomain(log);
      if (!domainResult.ok) {
        return err(new NotFoundError("HabitLog", id));
      }

      return ok(domainResult.value);
    } catch (error) {
      return err(new NotFoundError("HabitLog", id));
    }
  }

  async create(
    log: Omit<HabitLog, "id">
  ): Promise<Result<HabitLog, ValidationError>> {
    try {
      const validation = await this.validate(log);
      if (!validation.ok) {
        return validation;
      }

      const newId = `log_${uuidv4()}`;
      const persistenceData = HabitLogMapper.toPersistence({
        ...log,
        id: newId,
      });

      await db.insert(habit_logs_table).values(persistenceData);

      const created = await this.findById(newId);
      if (!created.ok) {
        return err(new ValidationError("Failed to retrieve created habit log"));
      }

      return ok(created.value);
    } catch (error) {
      return err(new ValidationError("Failed to create habit log"));
    }
  }

  async update(
    id: string,
    updates: Partial<HabitLog>
  ): Promise<Result<HabitLog, ValidationError | NotFoundError>> {
    try {
      const validation = await this.validate(updates);
      if (!validation.ok) {
        return validation;
      }

      const existingLog = await this.findById(id);
      if (!existingLog.ok) {
        return existingLog;
      }

      const dbUpdates = HabitLogMapper.toPersistenceUpdate({
        ...updates,
        id,
      });

      await db
        .update(habit_logs_table)
        .set({ ...dbUpdates, updatedAt: new Date() })
        .where(eq(habit_logs_table.id, id));

      const result = await this.findById(id);
      if (!result.ok) {
        return err(new NotFoundError("HabitLog", id));
      }

      return ok(result.value);
    } catch (error) {
      return err(new ValidationError("Failed to update habit log"));
    }
  }

  async delete(id: string): Promise<Result<void, NotFoundError>> {
    try {
      const result = await db
        .select()
        .from(habit_logs_table)
        .where(eq(habit_logs_table.id, id));

      const log = result[0];
      if (!log) {
        return err(new NotFoundError("HabitLog", id));
      }

      await db.delete(habit_logs_table).where(eq(habit_logs_table.id, id));
      return ok(void 0);
    } catch (error) {
      return err(new NotFoundError("HabitLog", id));
    }
  }

  async validate(
    log: Partial<HabitLog>
  ): Promise<Result<true, ValidationError>> {
    try {
      // Check required fields
      if (!log.habitId || !log.userId || !log.completedAt) {
        return err(new ValidationError("Missing required fields"));
      }

      // Create a temporary complete log for validation
      const tempLog = {
        id: "log_temp",
        habitId: log.habitId,
        userId: log.userId,
        completedAt: log.completedAt,
        value: log.value ?? null,
        notes: log.notes ?? null,
        details: log.details ? JSON.stringify(log.details) : null,
        difficulty: log.difficulty ?? null,
        feeling: log.feeling ?? null,
        hasPhoto: log.hasPhoto ?? false,
        photoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const validationResult = HabitLogMapper.toDomain(tempLog);
      if (!validationResult.ok) {
        return err(new ValidationError("Invalid habit log data"));
      }

      return ok(true);
    } catch (error) {
      return err(new ValidationError("Failed to validate habit log"));
    }
  }

  async exists(id: string): Promise<Result<boolean, NotFoundError>> {
    try {
      const result = await this.findById(id);
      return ok(result.ok);
    } catch (error) {
      return err(new NotFoundError("HabitLog", id));
    }
  }

  async isOwnedBy(
    id: string,
    userId: string
  ): Promise<Result<boolean, NotFoundError>> {
    try {
      const result = await db
        .select()
        .from(habit_logs_table)
        .where(eq(habit_logs_table.id, id));

      const log = result[0];
      if (!log) {
        return err(new NotFoundError("HabitLog", id));
      }

      return ok(log.userId === userId);
    } catch (error) {
      return err(new NotFoundError("HabitLog", id));
    }
  }

  async findByHabitId(
    habitId: string
  ): Promise<Result<HabitLog[], NotFoundError>> {
    try {
      const result = await db
        .select()
        .from(habit_logs_table)
        .where(eq(habit_logs_table.habitId, habitId))
        .orderBy(habit_logs_table.completedAt);

      const mappedLogs: HabitLog[] = [];
      for (const log of result) {
        const mappedResult = HabitLogMapper.toDomain(log);
        if (!mappedResult.ok) {
          return err(new NotFoundError("HabitLog", habitId));
        }
        mappedLogs.push(mappedResult.value);
      }

      return ok(mappedLogs);
    } catch (error) {
      return err(new NotFoundError("HabitLog", habitId));
    }
  }

  async findByDateRange(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<HabitLog[], ValidationError>> {
    try {
      // Ensure dates are in UTC
      const utcStartDate = new Date(startDate);
      const utcEndDate = new Date(endDate);

      const result = await db
        .select()
        .from(habit_logs_table)
        .where(
          and(
            eq(habit_logs_table.habitId, habitId),
            between(habit_logs_table.completedAt, utcStartDate, utcEndDate)
          )
        )
        .orderBy(desc(habit_logs_table.completedAt));

      const mappedLogs: HabitLog[] = [];
      for (const log of result) {
        const mappedResult = HabitLogMapper.toDomain(log);
        if (!mappedResult.ok) {
          return err(new ValidationError("Failed to map habit log"));
        }
        mappedLogs.push(mappedResult.value);
      }

      return ok(mappedLogs);
    } catch (error) {
      console.error("Error finding logs by date range:", error);
      return err(new ValidationError("Failed to find logs by date range"));
    }
  }

  async getCompletionSummaries(
    habitId: string,
    startDate: Date,
    endDate: Date,
    groupBy: "day" | "week" | "month" = "day"
  ): Promise<Result<CompletionSummary[], ValidationError | NotFoundError>> {
    try {
      const logsResult = await this.findByDateRange(
        habitId,
        startDate,
        endDate
      );
      if (!logsResult.ok) {
        return logsResult;
      }

      const logs = logsResult.value;
      if (logs.length === 0) {
        return ok([]);
      }

      const summaries: CompletionSummary[] = [];
      const groupedLogs = new Map<string, HabitLog[]>();

      // Group logs by the specified period
      for (const log of logs) {
        const date = log.completedAt;
        let key: string;

        switch (groupBy) {
          case "day": {
            const dateStr = date.toISOString().split("T")[0];
            if (!dateStr) {
              return err(new ValidationError("Invalid date format"));
            }
            key = dateStr;
            break;
          }
          case "week": {
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(date);
            monday.setDate(diff);
            const dateStr = monday.toISOString().split("T")[0];
            if (!dateStr) {
              return err(new ValidationError("Invalid date format"));
            }
            key = dateStr;
            break;
          }
          case "month":
          default: {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            key = `${year}-${month}`;
            break;
          }
        }

        const existingLogs = groupedLogs.get(key) ?? [];
        groupedLogs.set(key, [...existingLogs, log]);
      }

      // Convert grouped logs to summaries
      Array.from(groupedLogs.entries()).forEach(([dateStr, logs]) => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          return; // Skip invalid dates
        }
        summaries.push({
          date,
          count: logs.length,
          details: logs,
        });
      });

      return ok(summaries.sort((a, b) => a.date.getTime() - b.date.getTime()));
    } catch (error) {
      return err(new ValidationError("Failed to get completion summaries"));
    }
  }

  async getStreakSummaries(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<StreakSummary[], ValidationError | NotFoundError>> {
    try {
      const logsResult = await this.findByDateRange(
        habitId,
        startDate,
        endDate
      );
      if (!logsResult.ok) {
        return logsResult;
      }

      const logs = logsResult.value;
      if (logs.length === 0) {
        return ok([]);
      }

      const streakHistory: StreakSummary[] = [];
      let currentStreak = 0;

      for (let i = 0; i < logs.length; i++) {
        const currentLog = logs[i];
        if (!currentLog) continue;

        const previousLog = i > 0 ? logs[i - 1] : null;
        const currentDate = currentLog.completedAt;

        if (!previousLog) {
          currentStreak = 1;
          streakHistory.push({
            date: currentDate,
            streak: currentStreak,
            wasStreakBroken: false,
          });
          continue;
        }

        const previousDate = previousLog.completedAt;
        const daysBetween = Math.floor(
          (currentDate.getTime() - previousDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        const isOnTime = daysBetween <= 1;
        currentStreak = isOnTime ? currentStreak + 1 : 1;

        streakHistory.push({
          date: currentDate,
          streak: currentStreak,
          wasStreakBroken: !isOnTime,
        });
      }

      return ok(streakHistory);
    } catch (error) {
      return err(new ValidationError("Failed to get streak summaries"));
    }
  }

  async getCompletionRate(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<number, ValidationError | NotFoundError>> {
    try {
      const logsResult = await this.findByDateRange(
        habitId,
        startDate,
        endDate
      );
      if (!logsResult.ok) {
        return logsResult;
      }

      const logs = logsResult.value;
      const totalDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return ok((logs.length / totalDays) * 100);
    } catch (error) {
      return err(new ValidationError("Failed to calculate completion rate"));
    }
  }

  async getAverageDifficulty(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<number, ValidationError | NotFoundError>> {
    try {
      const result = await db
        .select({
          avgDifficulty: avg(habit_logs_table.difficulty).as("avgDifficulty"),
        })
        .from(habit_logs_table)
        .where(
          and(
            eq(habit_logs_table.habitId, habitId),
            between(habit_logs_table.completedAt, startDate, endDate)
          )
        );

      const avgDifficulty = result[0]?.avgDifficulty;
      return ok(typeof avgDifficulty === "number" ? avgDifficulty : 0);
    } catch (error) {
      return err(new ValidationError("Failed to calculate average difficulty"));
    }
  }
}
