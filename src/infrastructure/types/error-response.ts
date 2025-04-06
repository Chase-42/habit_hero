/**
 * Error response types and utilities for the API.
 * Defines standardized error responses and helper functions for creating them.
 */

import { z } from "zod";

/**
 * Base error response schema.
 * All error responses must follow this structure.
 */
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
  }),
});

/**
 * Type for error response.
 * Inferred from the errorResponseSchema.
 */
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

/**
 * Common error codes used across the application.
 * Organized by HTTP status code categories.
 */
export enum ErrorCode {
  // Validation errors (400)
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",

  // Habit-specific validation errors (400)
  INVALID_HABIT_TITLE = "INVALID_HABIT_TITLE",
  INVALID_HABIT_FREQUENCY = "INVALID_HABIT_FREQUENCY",
  INVALID_HABIT_CATEGORY = "INVALID_HABIT_CATEGORY",
  INVALID_HABIT_COLOR = "INVALID_HABIT_COLOR",
  INVALID_HABIT_REMINDER = "INVALID_HABIT_REMINDER",

  // Authentication errors (401)
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_TOKEN = "INVALID_TOKEN",

  // Authorization errors (403)
  FORBIDDEN = "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",

  // Resource errors (404)
  NOT_FOUND = "NOT_FOUND",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  HABIT_NOT_FOUND = "HABIT_NOT_FOUND",
  HABIT_LOG_NOT_FOUND = "HABIT_LOG_NOT_FOUND",

  // Conflict errors (409)
  CONFLICT = "CONFLICT",
  RESOURCE_EXISTS = "RESOURCE_EXISTS",
  HABIT_ALREADY_EXISTS = "HABIT_ALREADY_EXISTS",
  HABIT_ALREADY_COMPLETED = "HABIT_ALREADY_COMPLETED",

  // Server errors (500)
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
}

/**
 * Creates a standardized error response.
 * @param code - The error code from ErrorCode enum
 * @param message - A human-readable error message
 * @param details - Optional additional error details
 * @returns A properly formatted error response
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
}

/**
 * Creates a validation error response from a Zod error.
 * @param errors - The Zod validation error
 * @returns A properly formatted validation error response
 */
export function createValidationErrorResponse(
  errors: z.ZodError
): ErrorResponse {
  return {
    success: false,
    error: {
      code: ErrorCode.VALIDATION_ERROR,
      message: "Validation failed",
      details: errors.format(),
    },
  };
}

/**
 * Creates a habit-specific error response.
 * @param code - The habit-specific error code
 * @param message - A human-readable error message
 * @param habitId - The ID of the habit that caused the error
 * @param details - Optional additional error details
 * @returns A properly formatted habit error response
 */
export function createHabitErrorResponse(
  code: ErrorCode,
  message: string,
  habitId: string,
  details?: Record<string, unknown>
): ErrorResponse {
  return createErrorResponse(code, message, {
    habitId,
    ...details,
  });
}
