import { z } from "zod";

// Schema for creating a habit log
export const createHabitLogSchema = z.object({
  habitId: z.string().uuid("Invalid habit ID"),
  completedAt: z.string().datetime("Invalid date format").optional(),
  value: z
    .number()
    .min(0, "Value must be greater than or equal to 0")
    .optional(),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
});

// Schema for updating a habit log
export const updateHabitLogSchema = createHabitLogSchema.partial();

// Schema for habit log ID
export const habitLogIdSchema = z.object({
  id: z.string().uuid("Invalid habit log ID"),
});

// Schema for habit log list query parameters
export const habitLogListQuerySchema = z.object({
  habitId: z.string().uuid("Invalid habit ID").optional(),
  startDate: z.string().datetime("Invalid start date format").optional(),
  endDate: z.string().datetime("Invalid end date format").optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});
