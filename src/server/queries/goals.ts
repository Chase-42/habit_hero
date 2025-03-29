import { db } from "~/server/db";
import { goals } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import type { Goal } from "~/types/goal";

/**
 * Retrieves a goal by its ID
 * @param id - The unique identifier of the goal
 * @returns The goal if found, null otherwise
 */
export async function getGoalById(id: string): Promise<Goal | null> {
  const [goal] = await db.select().from(goals).where(eq(goals.id, id));

  if (!goal) return null;

  return {
    ...goal,
    description: goal.description ?? null,
    notes: goal.notes ?? null,
  };
}

/**
 * Updates a goal by its ID
 * @param id - The unique identifier of the goal
 * @param updates - The fields to update
 * @returns The updated goal if found, null otherwise
 */
export async function updateGoalById(
  id: string,
  updates: Partial<Omit<Goal, "id" | "createdAt">>
): Promise<Goal | null> {
  const [goal] = await db.select().from(goals).where(eq(goals.id, id));

  if (!goal) return null;

  const updatedGoal: Goal = {
    ...goal,
    ...updates,
    description: updates.description ?? null,
    notes: updates.notes ?? null,
    updatedAt: new Date(),
  };

  await db.update(goals).set(updatedGoal).where(eq(goals.id, id));
  return updatedGoal;
}

/**
 * Deletes a goal by its ID and user ID
 * @param id - The unique identifier of the goal
 * @param userId - The ID of the user who owns the goal
 * @returns true if the goal was deleted, false otherwise
 */
export async function deleteGoalById(
  id: string,
  userId: string
): Promise<boolean> {
  const [goal] = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, userId)));

  if (!goal) return false;

  await db.delete(goals).where(eq(goals.id, id));
  return true;
}
