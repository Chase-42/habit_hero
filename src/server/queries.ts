import { db } from "~/server/db";
import { habits, habitLogs } from "~/server/db/schema";
import type { Habit, HabitLog, HabitCategory } from "~/types";
import { eq, like, and, type SQL, between, desc } from "drizzle-orm";
import { FrequencyType } from "~/types/common/enums";

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

export async function getHabits(userId: string): Promise<Habit[]> {
  return db
    .select()
    .from(habits)
    .where(eq(habits.userId, userId))
    .orderBy(desc(habits.createdAt));
}

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

export async function deleteHabit(habitId: string): Promise<void> {
  await db.transaction(async (tx) => {
    // First delete all associated logs
    await tx.delete(habitLogs).where(eq(habitLogs.habitId, habitId));

    // Then delete the habit
    await tx.delete(habits).where(eq(habits.id, habitId));
  });
}

export async function getHabitById(id: string): Promise<Habit | null> {
  const result = await db.select().from(habits).where(eq(habits.id, id));
  return result[0] ?? null;
}

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

export async function getHabitLogs(habitId: string): Promise<HabitLog[]> {
  return db
    .select()
    .from(habitLogs)
    .where(eq(habitLogs.habitId, habitId))
    .orderBy(habitLogs.completedAt);
}

export async function getHabitLogsByDateRange(
  habitId: string,
  startDate: Date,
  endDate: Date
): Promise<HabitLog[]> {
  return db
    .select()
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.habitId, habitId),
        between(habitLogs.completedAt, startDate, endDate)
      )
    );
}

export type CompletionSummary = {
  date: Date;
  count: number;
  details: HabitLog[];
};

export type StreakSummary = {
  date: Date;
  streak: number;
  wasStreakBroken: boolean;
};

export async function getCompletionHistory(
  habitId: string,
  groupBy: "day" | "week" | "month" = "day"
): Promise<CompletionSummary[]> {
  const logs = await db
    .select()
    .from(habitLogs)
    .where(eq(habitLogs.habitId, habitId))
    .orderBy(habitLogs.completedAt);

  if (!logs || logs.length === 0) return [];

  const summaries: CompletionSummary[] = [];
  const groupedLogs = new Map<string, HabitLog[]>();

  // Group logs by the specified period
  for (const log of logs) {
    const date = new Date(log.completedAt);
    let key: string;

    switch (groupBy) {
      case "day":
        key = date.toISOString().split("T")[0] ?? date.toDateString();
        break;
      case "week": {
        // Get Monday of the week
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(date.setDate(diff));
        key = monday.toISOString().split("T")[0] ?? monday.toDateString();
        break;
      }
      case "month":
      default:
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
    }

    const existingLogs = groupedLogs.get(key) ?? [];
    groupedLogs.set(key, [...existingLogs, log]);
  }

  // Convert grouped logs to summaries
  Array.from(groupedLogs.entries()).forEach(([dateStr, logs]) => {
    summaries.push({
      date: new Date(dateStr),
      count: logs.length,
      details: logs,
    });
  });

  return summaries.sort((a, b) => a.date.getTime() - b.date.getTime());
}

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

    // Create a temporary habit state to check if this completion was on time
    const tempHabit = {
      ...habit,
      lastCompleted: previousLog.completedAt,
    };

    const isOnTime = await wasHabitCompletedOnTime(
      tempHabit,
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
