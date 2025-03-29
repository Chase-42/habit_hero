import { type Result, ok, err } from "~/application/types";
import { ValidationError } from "~/entities/errors";
import {
  type HabitLog,
  CreateHabitLog,
  UpdateHabitLog,
  HabitLogSchema,
} from "~/entities/models/habit-log";
import type { HabitLogDB } from "../database/types";

export class HabitLogMapper {
  static toDomain(dbLog: HabitLogDB): Result<HabitLog, ValidationError> {
    try {
      let details: HabitLog["details"] = undefined;
      if (dbLog.details) {
        try {
          const parsed = JSON.parse(dbLog.details) as unknown;
          const result = HabitLogSchema.shape.details.safeParse(parsed);
          if (result.success) {
            details = result.data;
          }
        } catch (error) {
          console.error("Failed to parse habit log details:", error);
        }
      }

      const log = {
        id: dbLog.id,
        habitId: dbLog.habitId,
        userId: dbLog.userId,
        value: dbLog.value ?? undefined,
        details,
        notes: dbLog.notes ?? undefined,
        difficulty: dbLog.difficulty ?? undefined,
        feeling: dbLog.feeling ?? undefined,
        hasPhoto: dbLog.hasPhoto,
        completedAt: dbLog.completedAt,
        createdAt: dbLog.createdAt,
        updatedAt: dbLog.updatedAt,
      };

      const validation = HabitLogSchema.safeParse(log);
      if (!validation.success) {
        console.error("Validation error:", validation.error);
        return err(new ValidationError("Invalid habit log data"));
      }

      return ok(validation.data);
    } catch (error) {
      return err(new ValidationError("Failed to map database log to domain"));
    }
  }

  static toPersistence(log: HabitLog): HabitLogDB {
    return {
      id: log.id,
      habitId: log.habitId,
      userId: log.userId,
      value: log.value ?? null,
      notes: log.notes ?? null,
      details: log.details ? JSON.stringify(log.details) : null,
      difficulty: log.difficulty ?? null,
      feeling: log.feeling ?? null,
      hasPhoto: log.hasPhoto,
      photoUrl: null,
      completedAt: log.completedAt,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    };
  }

  static toPersistenceUpdate(log: Partial<HabitLog>): Partial<HabitLogDB> {
    const update: Partial<HabitLogDB> = {};

    if (log.value !== undefined) update.value = log.value;
    if (log.notes !== undefined) update.notes = log.notes;
    if (log.details !== undefined) update.details = JSON.stringify(log.details);
    if (log.difficulty !== undefined) update.difficulty = log.difficulty;
    if (log.feeling !== undefined) update.feeling = log.feeling;
    if (log.hasPhoto !== undefined) update.hasPhoto = log.hasPhoto;
    if (log.completedAt !== undefined) update.completedAt = log.completedAt;

    return update;
  }

  static toPersistenceCreate(
    domainLog: Omit<HabitLog, "id" | "createdAt" | "updatedAt">
  ): Omit<HabitLogDB, "id" | "createdAt" | "updatedAt"> {
    return {
      habitId: domainLog.habitId,
      userId: domainLog.userId,
      value: domainLog.value ?? null,
      notes: domainLog.notes ?? null,
      details: domainLog.details ? JSON.stringify(domainLog.details) : null,
      difficulty: domainLog.difficulty ?? null,
      feeling: domainLog.feeling ?? null,
      hasPhoto: domainLog.hasPhoto,
      photoUrl: null,
      completedAt: domainLog.completedAt,
    };
  }
}
