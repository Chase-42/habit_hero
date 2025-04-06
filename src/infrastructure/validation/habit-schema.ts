/**
 * Habit validation schemas using Zod.
 * These schemas define the structure and validation rules for habit-related operations.
 */

import { z } from "zod";
import { HabitCategory, HabitColor, FrequencyType } from "../../domain/enums";

/**
 * Base schema for common habit fields.
 * This schema defines the core properties that all habits must have.
 */
const baseHabitSchema = z.object({
  /**
   * The title of the habit.
   * Must be between 1 and 100 characters.
   */
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),

  /**
   * Optional description of the habit.
   * Must be less than 500 characters if provided.
   */
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),

  /**
   * The category of the habit.
   * Must be one of the predefined HabitCategory values.
   */
  category: z.nativeEnum(HabitCategory, {
    errorMap: () => ({ message: "Invalid habit category" }),
  }),

  /**
   * The color associated with the habit.
   * Must be one of the predefined HabitColor values.
   */
  color: z.nativeEnum(HabitColor, {
    errorMap: () => ({ message: "Invalid habit color" }),
  }),

  /**
   * The type of frequency for the habit.
   * Must be one of the predefined FrequencyType values.
   */
  frequencyType: z.nativeEnum(FrequencyType, {
    errorMap: () => ({ message: "Invalid frequency type" }),
  }),

  /**
   * The value of the frequency (e.g., 3 times per week).
   * Must be an integer between 1 and 365.
   */
  frequencyValue: z
    .number()
    .int("Frequency value must be an integer")
    .min(1, "Frequency value must be at least 1")
    .max(365, "Frequency value must be less than 366"),

  /**
   * Optional reminder time for the habit.
   * Must be in HH:MM format if provided.
   */
  reminderTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")
    .optional(),
});

/**
 * Schema for creating a new habit.
 * Extends the base habit schema with all fields required.
 */
export const createHabitSchema = baseHabitSchema;

/**
 * Schema for updating an existing habit.
 * All fields are optional as partial updates are allowed.
 */
export const updateHabitSchema = baseHabitSchema.partial();

/**
 * Schema for habit completion.
 * Defines the structure for marking a habit as completed.
 */
export const completeHabitSchema = z.object({
  /**
   * Optional notes to add when completing a habit.
   * Must be less than 500 characters if provided.
   */
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
});

/**
 * Schema for habit ID validation.
 * Ensures the ID is a valid UUID.
 */
export const habitIdSchema = z.object({
  id: z.string().uuid("Invalid habit ID"),
});

/**
 * Schema for habit list query parameters.
 * Defines the filters and pagination options for listing habits.
 */
export const habitListQuerySchema = z.object({
  /**
   * Optional category filter.
   */
  category: z.nativeEnum(HabitCategory).optional(),

  /**
   * Optional filter for archived habits.
   */
  isArchived: z.boolean().optional(),

  /**
   * Optional page number for pagination.
   * Must be a positive integer.
   */
  page: z.number().int().min(1).optional(),

  /**
   * Optional limit for number of items per page.
   * Must be between 1 and 100.
   */
  limit: z.number().int().min(1).max(100).optional(),
});
