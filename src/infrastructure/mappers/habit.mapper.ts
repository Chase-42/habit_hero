import { z } from "zod";
import { Result } from "~/application/types";
import { ValidationError } from "~/application/errors";
import {
  type HabitDetails,
  type BaseEntity,
  type UserOwned,
} from "~/entities/types/common/utils";
import {
  type Habit as DomainHabit,
  type FrequencyValue,
  FrequencyType,
  HabitColor,
  HabitCategory,
  HabitSchema,
  FrequencyValueSchema,
} from "~/entities/models/habit";
import {
  type HabitLog as DomainHabitLog,
  HabitLogSchema,
} from "~/entities/models/habit-log";
import {
  habits_table,
  habit_logs_table,
  type DB_HabitType,
  type DB_HabitLogType,
  type NewDB_Habit,
  type NewDB_HabitLog,
} from "../database/schema";
import { injectable } from "tsyringe";

const rawHabitSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  color: z.string(),
  icon: z.string().optional(),
  frequencyType: z.string(),
  frequencyValue: z.string(),
  streak: z.number().or(z.string()),
  longestStreak: z.number().or(z.string()),
  isActive: z.number().or(z.boolean()),
  isArchived: z.number().or(z.boolean()),
  isCompleted: z.number().or(z.boolean()),
  lastCompleted: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  notes: z.string().nullable(),
});

const rawHabitLogSchema = z.object({
  id: z.string(),
  habitId: z.string(),
  userId: z.string(),
  value: z.string(),
  notes: z.string(),
  details: z.unknown(),
  difficulty: z.string(),
  feeling: z.string(),
  hasPhoto: z.boolean(),
  completedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

type RawFrequencyValue = z.infer<typeof FrequencyValueSchema>;

function parseFrequencyValue(
  value: string
): Result<FrequencyValue, ValidationError> {
  try {
    const parsed = JSON.parse(value) as unknown;
    const result = FrequencyValueSchema.safeParse(parsed);
    if (!result.success) {
      return {
        ok: false,
        error: new ValidationError(
          `Invalid frequency value format: ${result.error.message}`
        ),
      };
    }
    return { ok: true, value: result.data };
  } catch (error) {
    return {
      ok: false,
      error: new ValidationError(
        error instanceof Error
          ? `Invalid frequency value: ${error.message}`
          : "Invalid frequency value format"
      ),
    };
  }
}

function stringifyFrequencyValue(value: FrequencyValue): string {
  try {
    const result = FrequencyValueSchema.safeParse(value);
    if (!result.success) {
      throw new ValidationError(
        `Invalid frequency value: ${result.error.message}`
      );
    }
    return JSON.stringify(value);
  } catch (error) {
    throw new ValidationError(
      error instanceof Error
        ? `Failed to stringify frequency value: ${error.message}`
        : "Failed to stringify frequency value"
    );
  }
}

const isFrequencyValue = (value: unknown): value is FrequencyValue => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;

  if (typeof obj.type !== "string") {
    return false;
  }

  switch (obj.type) {
    case "daily":
      return true;
    case "weekly":
      return (
        Array.isArray(obj.daysOfWeek) &&
        obj.daysOfWeek.every((d) => typeof d === "number" && d >= 0 && d <= 6)
      );
    case "monthly":
      return (
        Array.isArray(obj.daysOfMonth) &&
        obj.daysOfMonth.every((d) => typeof d === "number" && d >= 1 && d <= 31)
      );
    case "specific_days":
      return (
        Array.isArray(obj.days) && obj.days.every((d) => d instanceof Date)
      );
    default:
      return false;
  }
};

function isHabitDetails(value: unknown): value is HabitDetails {
  if (typeof value !== "object" || value === null) return false;
  const details = value as Record<string, unknown>;

  // Check if all properties are either undefined or of the correct type
  return (
    (details.duration === undefined || typeof details.duration === "number") &&
    (details.distance === undefined || typeof details.distance === "number") &&
    (details.sets === undefined || typeof details.sets === "number") &&
    (details.reps === undefined || typeof details.reps === "number") &&
    (details.weight === undefined || typeof details.weight === "number") &&
    (details.intensity === undefined ||
      typeof details.intensity === "number") &&
    (details.customFields === undefined ||
      (typeof details.customFields === "object" &&
        details.customFields !== null &&
        Object.entries(details.customFields).every(
          ([_, v]) =>
            typeof v === "string" ||
            typeof v === "number" ||
            typeof v === "boolean"
        )))
  );
}

const isValidFrequencyType = (value: string): boolean => {
  return value === "daily" || value === "weekly" || value === "monthly";
};

const isValidCategory = (value: string): boolean => {
  return (
    value === "fitness" ||
    value === "nutrition" ||
    value === "mindfulness" ||
    value === "productivity" ||
    value === "other"
  );
};

const isValidColor = (value: string): boolean => {
  return (
    value === "red" ||
    value === "green" ||
    value === "blue" ||
    value === "yellow" ||
    value === "purple" ||
    value === "pink" ||
    value === "orange"
  );
};

function safeJsonParse<T extends Record<string, unknown>>(
  json: string
): T | null {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (typeof parsed !== "object" || parsed === null) return null;
    return parsed as T;
  } catch {
    return null;
  }
}

@injectable()
export class HabitMapper {
  public static toDomain(
    raw: DB_HabitType
  ): Result<DomainHabit, ValidationError> {
    try {
      const parseResult = rawHabitSchema.safeParse(raw);
      if (!parseResult.success) {
        return {
          ok: false,
          error: new ValidationError(parseResult.error.message),
        };
      }

      const validated = parseResult.data;
      const frequencyValueResult = parseFrequencyValue(
        validated.frequencyValue
      );
      if (!frequencyValueResult.ok) {
        return frequencyValueResult;
      }

      const domainHabit = {
        id: validated.id,
        userId: validated.userId,
        title: validated.title,
        description: validated.description ?? "",
        category: validated.category as HabitCategory,
        color: validated.color as HabitColor,
        icon: validated.icon ?? "",
        frequencyType: validated.frequencyType as FrequencyType,
        frequencyValue: frequencyValueResult.value,
        streak: Number(validated.streak),
        longestStreak: Number(validated.longestStreak),
        isCompleted:
          typeof validated.isCompleted === "number"
            ? validated.isCompleted === 1
            : validated.isCompleted,
        isActive:
          typeof validated.isActive === "number"
            ? validated.isActive === 1
            : validated.isActive,
        isArchived:
          typeof validated.isArchived === "number"
            ? validated.isArchived === 1
            : validated.isArchived,
        lastCompleted: validated.lastCompleted,
        notes: validated.notes ?? "",
        createdAt: validated.createdAt,
        updatedAt: validated.updatedAt,
      };

      const habitResult = HabitSchema.safeParse(domainHabit);
      if (!habitResult.success) {
        return {
          ok: false,
          error: new ValidationError(habitResult.error.message),
        };
      }
      return { ok: true, value: habitResult.data };
    } catch (error) {
      return {
        ok: false,
        error: new ValidationError(
          error instanceof Error ? error.message : "Unknown error"
        ),
      };
    }
  }

  public static toPersistence(habit: DomainHabit): NewDB_Habit {
    const result = HabitSchema.safeParse(habit);
    if (!result.success) {
      throw new ValidationError(result.error.message);
    }

    const validated = result.data;
    return {
      id: validated.id,
      userId: validated.userId,
      name: validated.title,
      description: validated.description || "",
      category: validated.category,
      color: validated.color,
      icon: validated.icon || "",
      frequencyType: validated.frequencyType,
      frequencyValue: stringifyFrequencyValue(validated.frequencyValue),
      streak: validated.streak,
      longestStreak: validated.longestStreak,
      isCompleted: validated.isCompleted ? 1 : 0,
      isActive: validated.isActive ? 1 : 0,
      isArchived: validated.isArchived ? 1 : 0,
      lastCompleted: validated.lastCompleted,
      notes: validated.notes || "",
      createdAt: validated.createdAt,
      updatedAt: validated.updatedAt,
    };
  }

  public static toDomainLog(
    raw: DB_HabitLogType
  ): Result<DomainHabitLog, ValidationError> {
    try {
      const parseResult = HabitLogSchema.safeParse(raw);
      if (!parseResult.success) {
        return {
          ok: false,
          error: new ValidationError(parseResult.error.message),
        };
      }

      const validated = parseResult.data;
      const domainLog = {
        id: validated.id,
        habitId: validated.habitId,
        value: validated.value,
        difficulty: validated.difficulty,
        notes: validated.notes ?? "",
        createdAt: validated.createdAt,
        updatedAt: validated.updatedAt,
      };

      const logResult = HabitLogSchema.safeParse(domainLog);
      if (!logResult.success) {
        return {
          ok: false,
          error: new ValidationError(logResult.error.message),
        };
      }
      return { ok: true, value: logResult.data };
    } catch (error) {
      return {
        ok: false,
        error: new ValidationError(
          error instanceof Error ? error.message : "Unknown error"
        ),
      };
    }
  }

  public static toPersistenceLog(log: DomainHabitLog): NewDB_HabitLog {
    const result = HabitLogSchema.safeParse(log);
    if (!result.success) {
      throw new ValidationError(result.error.message);
    }

    const validated = result.data;
    return {
      id: validated.id,
      habitId: validated.habitId,
      userId: validated.userId,
      value: validated.value?.toString() ?? "",
      notes: validated.notes ?? "",
      details: validated.details ? JSON.stringify(validated.details) : "",
      difficulty: validated.difficulty?.toString() ?? "",
      feeling: validated.feeling ?? "",
      hasPhoto: validated.hasPhoto ? 1 : 0,
      completedAt: validated.completedAt,
      createdAt: validated.createdAt,
      updatedAt: validated.updatedAt,
    };
  }
}
