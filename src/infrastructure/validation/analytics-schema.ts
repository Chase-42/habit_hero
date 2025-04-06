import { z } from "zod";
import { HabitCategory } from "../../domain/enums";

// Schema for analytics query parameters
export const analyticsQuerySchema = z.object({
  type: z.enum(["completion", "streak"]),
  habitId: z.string().uuid("Invalid habit ID").optional(),
  category: z.nativeEnum(HabitCategory).optional(),
  startDate: z.string().datetime("Invalid start date format").optional(),
  endDate: z.string().datetime("Invalid end date format").optional(),
  groupBy: z.enum(["day", "week", "month"]).optional(),
});

// Schema for completion analytics response
export const completionAnalyticsSchema = z.object({
  totalCompletions: z.number().int().min(0),
  averageCompletions: z.number().min(0),
  completionRate: z.number().min(0).max(100),
  dailyCompletions: z.record(z.number().int().min(0)),
});

// Schema for streak analytics response
export const streakAnalyticsSchema = z.object({
  currentStreak: z.number().int().min(0),
  longestStreak: z.number().int().min(0),
  averageStreak: z.number().min(0),
  streakHistory: z.array(
    z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      length: z.number().int().min(0),
    })
  ),
});
