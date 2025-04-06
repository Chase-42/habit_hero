import { db } from "~/server/db";
import { habits, habitLogs } from "~/server/db/schema";
import { Habit } from "~/domain/entities/habit";
import { HabitLog } from "~/domain/entities/habit-log";
import type { CompletionSummary, StreakSummary } from "~/server/queries";
import { eq, like, or, and, type SQL, between, desc } from "drizzle-orm";
import {
  type HabitCategory,
  FrequencyType,
  type HabitColor,
} from "~/domain/enums";
import type { FrequencyValue } from "~/domain/utils/frequency";
import type { HabitDetails } from "~/types";
import {
  toDomainHabit,
  toDbHabit,
  toDomainHabitLog,
  toDbHabitLog,
} from "~/infrastructure/type-converters/habit-converter";
import {
  isWithinInterval,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

// Define types from the schema
type HabitRow = typeof habits.$inferSelect;

// Define a type-safe filter interface based on the schema
type HabitFilter = {
  userId: string;
  isActive?: boolean;
  isArchived?: boolean;
  category?: HabitCategory;
  searchQuery?: string;
};

/**
 * Gets all habits for a user
 * @param userId - The ID of the user
 * @returns Array of habits
 */
export async function getHabits(userId: string): Promise<Habit[]> {
  const results = await db
    .select()
    .from(habits)
    .where(eq(habits.userId, userId))
    .orderBy(desc(habits.createdAt));

  return results.map(toDomainHabit);
}

/**
 * Gets filtered habits based on criteria
 * @param filters - Filter criteria
 * @returns Array of filtered habits
 */
export async function getFilteredHabits(filters: {
  userId: string;
  isActive?: boolean;
  isArchived?: boolean;
  category?: HabitCategory;
  searchQuery?: string;
}): Promise<Habit[]> {
  const { userId, isActive, isArchived, category, searchQuery } = filters;

  const conditions: SQL<unknown>[] = [];
  conditions.push(eq(habits.userId, userId));

  if (typeof isActive === "boolean") {
    conditions.push(eq(habits.isActive, isActive));
  }

  if (typeof isArchived === "boolean") {
    conditions.push(eq(habits.isArchived, isArchived));
  }

  if (category) {
    conditions.push(eq(habits.category, category));
  }

  if (searchQuery) {
    conditions.push(like(habits.name, `%${searchQuery}%`));
  }

  const results = await db
    .select()
    .from(habits)
    .where(and(...conditions));

  return results.map(toDomainHabit);
}

/**
 * Creates a new habit
 * @param params - The habit creation parameters
 * @returns The created habit
 */
export async function createHabit(params: {
  userId: string;
  name: string;
  description?: string;
  category: HabitCategory;
  color: HabitColor;
  frequencyType: FrequencyType;
  frequencyValue: FrequencyValue;
  subCategory?: string;
  goal?: number;
  metricType?: string;
  units?: string;
  notes?: string;
  reminder?: Date;
  reminderEnabled?: boolean;
}): Promise<Habit> {
  const newHabit = Habit.create(params);
  await db.insert(habits).values(toDbHabit(newHabit));
  return newHabit;
}

/**
 * Updates a habit
 * @param id - The habit ID
 * @param updates - The updates to apply
 */
export async function updateHabit(
  id: string,
  updates: {
    name?: string;
    description?: string;
    category?: HabitCategory;
    color?: HabitColor;
    frequencyType?: FrequencyType;
    frequencyValue?: FrequencyValue;
    subCategory?: string;
    goal?: number;
    metricType?: string;
    units?: string;
    notes?: string;
    reminder?: Date;
    reminderEnabled?: boolean;
    isActive?: boolean;
    isArchived?: boolean;
  }
): Promise<void> {
  const habit = await getHabitById(id);
  if (!habit) {
    throw new Error(`Habit with id ${id} not found`);
  }

  const updatedHabit = habit.update(updates);
  await db.update(habits).set(toDbHabit(updatedHabit)).where(eq(habits.id, id));
}

/**
 * Deletes a habit and its logs
 * @param habitId - The habit ID
 */
export async function deleteHabit(habitId: string): Promise<void> {
  // First delete all associated logs
  await db.delete(habitLogs).where(eq(habitLogs.habitId, habitId));

  // Then delete the habit
  await db.delete(habits).where(eq(habits.id, habitId));
}

/**
 * Gets a habit by ID
 * @param id - The habit ID
 * @returns The habit if found, null otherwise
 */
export async function getHabitById(id: string): Promise<Habit | null> {
  const result = await db.select().from(habits).where(eq(habits.id, id));
  if (!result[0]) return null;

  return toDomainHabit(result[0]);
}

/**
 * Completes a habit
 * @param habitId - The habit ID
 * @param completedAt - The completion time
 * @returns The updated habit
 */
export async function completeHabit(
  habitId: string,
  completedAt: Date = new Date()
): Promise<Habit> {
  const habit = await getHabitById(habitId);
  if (!habit) {
    throw new Error(`Habit with id ${habitId} not found`);
  }

  const wasOnTime = await wasHabitCompletedOnTime(habit, completedAt);
  const updatedHabit = wasOnTime ? habit.complete(completedAt) : habit;

  await db
    .update(habits)
    .set(toDbHabit(updatedHabit))
    .where(eq(habits.id, habitId));
  return updatedHabit;
}

/**
 * Checks if a habit was completed on time
 * @param habit - The habit
 * @param completedAt - The completion time
 * @returns Whether the habit was completed on time
 */
async function wasHabitCompletedOnTime(
  habit: Habit,
  completedAt: Date
): Promise<boolean> {
  // Get the most recent log before this completion
  const previousLogs = await db
    .select()
    .from(habitLogs)
    .where(
      and(eq(habitLogs.habitId, habit.id), eq(habitLogs.userId, habit.userId))
    )
    .orderBy(habitLogs.completedAt);

  const lastLog = previousLogs[previousLogs.length - 1];
  const lastCompletionDate = lastLog?.completedAt ?? habit.createdAt;

  // If this is the first completion, it's always on time
  if (!lastLog) return true;

  switch (habit.frequencyType) {
    case FrequencyType.DAILY:
      return isWithinInterval(completedAt, {
        start: startOfDay(lastCompletionDate),
        end: endOfDay(lastCompletionDate),
      });
    case FrequencyType.WEEKLY:
      return isWithinInterval(completedAt, {
        start: startOfWeek(lastCompletionDate),
        end: endOfWeek(lastCompletionDate),
      });
    case FrequencyType.MONTHLY:
      return isWithinInterval(completedAt, {
        start: startOfMonth(lastCompletionDate),
        end: endOfMonth(lastCompletionDate),
      });
    case FrequencyType.CUSTOM:
      // For custom frequency, we'll need to implement custom logic
      return true;
    default:
      return false;
  }
}

/**
 * Updates a habit's streak
 * @param habit - The habit
 * @param completedAt - The completion time
 */
export async function updateHabitStreak(
  habit: Habit,
  completedAt: Date
): Promise<void> {
  const isOnTime = await wasHabitCompletedOnTime(habit, completedAt);

  // Use the domain entity's complete method instead of trying to modify properties directly
  const updatedHabit = habit.complete(completedAt);

  // Convert to database format and update
  await db
    .update(habits)
    .set(toDbHabit(updatedHabit))
    .where(eq(habits.id, habit.id));
}

/**
 * Logs a habit completion
 * @param log - The log data
 * @returns The created log
 */
export async function logHabit(log: Omit<HabitLog, "id">): Promise<HabitLog> {
  const habit = await getHabitById(log.habitId);
  if (!habit) {
    throw new Error("Habit not found");
  }

  const newLog: HabitLog = {
    ...log,
    id: crypto.randomUUID(),
  };

  await db.insert(habitLogs).values(newLog);
  await updateHabitStreak(habit, log.completedAt);

  return newLog;
}

/**
 * Gets logs for a habit
 * @param habitId - The habit ID
 * @returns Array of logs
 */
export async function getHabitLogs(habitId: string): Promise<HabitLog[]> {
  const results = await db
    .select()
    .from(habitLogs)
    .where(eq(habitLogs.habitId, habitId))
    .orderBy(desc(habitLogs.completedAt));

  return results.map(toDomainHabitLog);
}

/**
 * Gets logs for a habit within a date range
 * @param habitId - The habit ID
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Array of logs
 */
export async function getHabitLogsByDateRange(
  habitId: string,
  startDate: Date,
  endDate: Date
): Promise<HabitLog[]> {
  const logs = await db
    .select()
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.habitId, habitId),
        between(habitLogs.completedAt, startDate, endDate)
      )
    )
    .orderBy(desc(habitLogs.completedAt));

  return logs.map(toDomainHabitLog);
}

function getGroupKey(date: Date, groupBy: "day" | "week" | "month"): string {
  switch (groupBy) {
    case "day":
      return date.toISOString().split("T")[0] ?? date.toDateString();
    case "week": {
      // Get Monday of the week
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date.setDate(diff));
      return monday.toISOString().split("T")[0] ?? monday.toDateString();
    }
    case "month":
    default:
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }
}

/**
 * Gets completion history for a habit
 * @param habitId - The habit ID
 * @param groupBy - How to group the history
 * @returns Array of completion summaries
 */
export async function getCompletionHistory(
  habitId: string,
  groupBy: "day" | "week" | "month" = "day"
): Promise<CompletionSummary[]> {
  const logs = await getHabitLogs(habitId);
  const groupedLogs = new Map<string, HabitLog[]>();

  for (const log of logs) {
    const key = getGroupKey(log.completedAt, groupBy);
    const existingLogs = groupedLogs.get(key) ?? [];
    groupedLogs.set(key, [
      ...existingLogs,
      {
        ...log,
        createdAt: log.completedAt,
        updatedAt: log.completedAt,
      },
    ]);
  }

  const summaries: CompletionSummary[] = [];

  // Convert grouped logs to summaries
  for (const [key, logs] of groupedLogs.entries()) {
    summaries.push({
      date: new Date(key),
      count: logs.length,
      details: logs,
    });
  }

  return summaries.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Gets streak history for a habit
 * @param habitId - The habit ID
 * @param startDate - Optional start date
 * @param endDate - Optional end date
 * @returns Array of streak summaries
 */
export async function getStreakHistory(
  habitId: string,
  startDate: Date | null = null,
  endDate: Date | null = null
): Promise<StreakSummary[]> {
  const habit = await getHabitById(habitId);
  if (!habit) throw new Error("Habit not found");

  const conditions = [eq(habitLogs.habitId, habitId)];

  if (startDate && endDate) {
    conditions.push(between(habitLogs.completedAt, startDate, endDate));
  }

  const logs = await db
    .select()
    .from(habitLogs)
    .where(and(...conditions))
    .orderBy(habitLogs.completedAt);

  if (!logs || logs.length === 0) return [];

  const streakHistory: StreakSummary[] = [];
  let currentStreak = 0;

  for (const currentLog of logs) {
    const previousLog =
      streakHistory.length > 0 ? logs[logs.indexOf(currentLog) - 1] : null;

    // For the first log, check against habit creation date
    if (!previousLog) {
      const isOnTime = await wasHabitCompletedOnTime(
        habit,
        currentLog.completedAt
      );
      currentStreak = isOnTime ? 1 : 0;
      streakHistory.push({
        date: currentLog.completedAt,
        streak: currentStreak,
        wasStreakBroken: !isOnTime,
      });
      continue;
    }

    // For subsequent logs, we don't need to modify the habit
    // since wasHabitCompletedOnTime only checks the lastCompleted date
    const isOnTime = await wasHabitCompletedOnTime(
      habit,
      currentLog.completedAt
    );
    currentStreak = isOnTime ? currentStreak + 1 : 1;

    streakHistory.push({
      date: currentLog.completedAt,
      streak: currentStreak,
      wasStreakBroken: !isOnTime,
    });
  }

  return streakHistory;
}

/**
 * Creates a new habit log
 * @param params - The log creation parameters
 * @returns The created log
 */
export async function createHabitLog(params: {
  habitId: string;
  userId: string;
  value?: number;
  notes?: string;
  details?: Record<string, unknown>;
  difficulty?: number;
  feeling?: string;
  hasPhoto?: boolean;
  photoUrl?: string;
}): Promise<HabitLog> {
  const newLog = HabitLog.create(params);
  await db.insert(habitLogs).values(toDbHabitLog(newLog));
  return newLog;
}

/**
 * Updates a habit log
 * @param id - The log ID
 * @param updates - The updates to apply
 */
export async function updateHabitLog(
  id: string,
  updates: {
    value?: number;
    notes?: string;
    details?: Record<string, unknown>;
    difficulty?: number;
    feeling?: string;
    hasPhoto?: boolean;
    photoUrl?: string;
  }
): Promise<void> {
  const log = await getHabitLogById(id);
  if (!log) {
    throw new Error(`Habit log with id ${id} not found`);
  }

  const updatedLog = log.update(updates);
  await db
    .update(habitLogs)
    .set(toDbHabitLog(updatedLog))
    .where(eq(habitLogs.id, id));
}

/**
 * Gets a habit log by ID
 * @param id - The log ID
 * @returns The log if found, null otherwise
 */
export async function getHabitLogById(id: string): Promise<HabitLog | null> {
  const result = await db.select().from(habitLogs).where(eq(habitLogs.id, id));
  if (!result[0]) return null;

  return toDomainHabitLog(result[0]);
}
