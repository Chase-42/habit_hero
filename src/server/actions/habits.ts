"use server";

import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { habits, habitLogs } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function deleteHabit(habitId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // First delete all associated logs
    await db.delete(habitLogs).where(eq(habitLogs.habitId, habitId));

    // Then delete the habit
    await db.delete(habits).where(eq(habits.id, habitId));

    // Revalidate the dashboard page
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error deleting habit:", error);
    throw new Error("Failed to delete habit");
  }
}
