import { db } from "~/server/db";
import { habits, habitLogs } from "~/server/db/schema";
import type { Habit } from "~/types";
import type {
  HabitLog,
  CompletionSummary,
  StreakSummary,
} from "~/types/models/log";
import { eq, like, or, and, type SQL, between, desc } from "drizzle-orm";
import { type HabitCategory, FrequencyType } from "~/types/common/enums";

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

  return results.map((habit) => ({
    ...habit,
  }));
}

/**
 * Gets filtered habits based on criteria
 * @param filters - Filter criteria
 * @returns Array of filtered habits
 */
export async function getFilteredHabits(
  filters: HabitFilter
): Promise<HabitRow[]> {
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

  return db
    .select()
    .from(habits)
    .where(and(...conditions));
}

/**
 * Creates a new habit
 * @param habit - The habit data
 * @returns The created habit
 */
export async function createHabit(
  habit: Omit<
    Habit,
    "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
  >
): Promise<Habit> {
  const newHabit: Habit = {
    ...habit,
    id: crypto.randomUUID(),
    streak: 0,
    longestStreak: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await db.insert(habits).values(newHabit);
  return newHabit;
}

/**
 * Updates a habit
 * @param id - The habit ID
 * @param updates - The updates to apply
 */
export async function updateHabit(
  id: string,
  updates: Partial<Omit<Habit, "id" | "createdAt">>
): Promise<void> {
  await db
    .update(habits)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(habits.id, id));
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

  return {
    ...result[0],
  };
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

  const daysBetween = Math.floor(
    (completedAt.getTime() - lastCompletionDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  switch (habit.frequencyType) {
    case FrequencyType.Daily:
      return daysBetween <= 1;
    case FrequencyType.Weekly:
      return daysBetween <= 7;
    case FrequencyType.Monthly:
      // Check if it's within the same month or the next month
      const lastMonth = lastCompletionDate.getMonth();
      const currentMonth = completedAt.getMonth();
      const monthDiff = (currentMonth - lastMonth + 12) % 12;
      return monthDiff <= 1;
    default:
      return false;
  }
}

/**
 * Updates a habit's streak
 * @param habit - The habit
 * @param completedAt - The completion time
 */
async function updateHabitStreak(
  habit: Habit,
  completedAt: Date
): Promise<void> {
  const isOnTime = await wasHabitCompletedOnTime(habit, completedAt);

  const newStreak = isOnTime ? habit.streak + 1 : 1;
  const newLongestStreak = Math.max(habit.longestStreak, newStreak);

  await updateHabit(habit.id, {
    streak: newStreak,
    longestStreak: newLongestStreak,
    lastCompleted: completedAt,
  });
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
  const logs = await db
    .select()
    .from(habitLogs)
    .where(eq(habitLogs.habitId, habitId))
    .orderBy(desc(habitLogs.completedAt));

  return logs.map((log) => ({
    ...log,
    createdAt: log.completedAt,
    updatedAt: log.completedAt,
  }));
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

  return logs.map((log) => ({
    ...log,
    createdAt: log.completedAt,
    updatedAt: log.completedAt,
  }));
}

function getGroupKey(date: Date, groupBy: "day" | "week" | "month"): string {
  switch (groupBy) {
    case "day":
      return date.toISOString().split("T")[0] ?? date.toDateString();
    case "week": {
      // Get Monday of the week
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date);
      monday.setDate(diff);
      monday.setHours(0, 0, 0, 0);
      return monday.toISOString().split("T")[0] ?? monday.toDateString();
    }
    case "month":
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
    default:
      return date.toISOString().split("T")[0] ?? date.toDateString();
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
    const date = new Date(log.completedAt);
    date.setHours(0, 0, 0, 0);
    let key: string;

    switch (groupBy) {
      case "day":
        key = date.toISOString().split("T")[0] ?? date.toDateString();
        break;
      case "week": {
        // Get Monday of the week
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(date);
        monday.setDate(diff);
        monday.setHours(0, 0, 0, 0);
        key = monday.toISOString().split("T")[0] ?? monday.toDateString();
        break;
      }
      case "month":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
        break;
      default:
        key = date.toISOString().split("T")[0] ?? date.toDateString();
    }

    const existingLogs = groupedLogs.get(key) ?? [];
    groupedLogs.set(key, [...existingLogs, log]);
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
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    conditions.push(between(habitLogs.completedAt, start, end));
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
    const logDate = new Date(currentLog.completedAt);
    logDate.setHours(0, 0, 0, 0);

    const previousLog =
      streakHistory.length > 0 ? logs[logs.indexOf(currentLog) - 1] : null;

    // For the first log, check against habit creation date
    if (!previousLog) {
      const isOnTime = await wasHabitCompletedOnTime(habit, logDate);
      currentStreak = isOnTime ? 1 : 0;
      streakHistory.push({
        date: logDate,
        streak: currentStreak,
        wasStreakBroken: !isOnTime,
      });
      continue;
    }

    // Create a temporary habit state to check if this completion was on time
    const previousLogDate = new Date(previousLog.completedAt);
    previousLogDate.setHours(0, 0, 0, 0);

    const tempHabit = {
      ...habit,
      lastCompleted: previousLogDate,
    };

    const isOnTime = await wasHabitCompletedOnTime(tempHabit, logDate);
    currentStreak = isOnTime ? currentStreak + 1 : 1;

    streakHistory.push({
      date: logDate,
      streak: currentStreak,
      wasStreakBroken: !isOnTime,
    });
  }

  return streakHistory;
}
