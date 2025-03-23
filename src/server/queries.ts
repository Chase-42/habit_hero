import { db } from "~/server/db";
import { habits, habitLogs } from "~/server/db/schema";
import type { Habit, HabitLog } from "~/types";
import { eq } from "drizzle-orm";

export async function getHabits(userId: string): Promise<Habit[]> {
  return db.select().from(habits).where(eq(habits.userId, userId));
}

export async function createHabit(habit: Omit<Habit, "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak">): Promise<Habit> {
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

export async function updateHabit(id: string, updates: Partial<Omit<Habit, "id" | "createdAt">>): Promise<void> {
  await db.update(habits)
    .set({
      ...updates,
      updatedAt: new Date()
    })
    .where(eq(habits.id, id));
}

export async function deleteHabit(id: string): Promise<void> {  
  await db.delete(habits).where(eq(habits.id, id));
}   

export async function getHabitById(id: string): Promise<Habit | null> {
  const result = await db.select().from(habits).where(eq(habits.id, id));
  return result[0] ?? null;
}

export async function logHabit(log: Omit<HabitLog, "id">): Promise<HabitLog> {
  const newLog: HabitLog = {
    ...log,
    id: crypto.randomUUID(),
  };
  await db.insert(habitLogs).values(newLog);
  return newLog;
}

export async function getHabitLogs(habitId: string): Promise<HabitLog[]> {
  return db.select()
    .from(habitLogs)
    .where(eq(habitLogs.habitId, habitId))
    .orderBy(habitLogs.completedAt);
}


