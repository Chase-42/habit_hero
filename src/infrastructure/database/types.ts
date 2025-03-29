import type { FrequencyValue } from "~/entities/models/habit";
import { FrequencyValueSchema } from "~/entities/models/habit";
import { z } from "zod";
import { type habits_table } from "../database/schema";

// Database Types
export type DB_FrequencyValue = string;

// Type assertion for Drizzle's inferred types
export type DB_HabitType = typeof habits_table.$inferSelect;
export type DB_HabitRow = typeof habits_table.$inferSelect;

export type DB_HabitLogRow = {
  id: string;
  habitId: string;
  userId: string;
  completedAt: Date;
  value: number | null;
  notes: string | null;
  details: string | null; // Stored as stringified JSON
  difficulty: number | null;
  feeling: string | null;
  hasPhoto: boolean;
  photoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type HabitLogDB = DB_HabitLogRow;

// Type-safe transformations
export function serializeFrequencyValue(
  value: FrequencyValue
): DB_FrequencyValue {
  const result = FrequencyValueSchema.safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid frequency value: ${result.error.message}`);
  }
  return JSON.stringify(value);
}

export function deserializeFrequencyValue(
  value: DB_FrequencyValue | Record<string, unknown>
): FrequencyValue {
  try {
    console.log("Deserializing frequency value:", value);
    let parsed: unknown;

    if (typeof value === "string") {
      // Handle escaped JSON string
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      parsed = JSON.parse(value);
    } else if (typeof value === "object" && value !== null) {
      // If it's already an object, validate it directly
      parsed = value;
    } else {
      throw new Error(`Invalid frequency value type: ${typeof value}`);
    }

    console.log("Parsed frequency value:", parsed);
    const result = FrequencyValueSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error(
        `Invalid frequency value format: ${result.error.message}`
      );
    }
    return result.data;
  } catch (error) {
    console.error("Error deserializing frequency value:", error);
    throw new Error(
      `Failed to parse frequency value: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
