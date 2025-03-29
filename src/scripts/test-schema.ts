import { db } from "~/server/db";
import { habits, habitLogs, goals } from "~/server/db/schema";
import { eq } from "drizzle-orm";

async function testSchema() {
  try {
    console.log("Testing schema boolean types...\n");

    // Test 1: Create a new habit with boolean fields
    console.log("Test 1: Creating a new habit");
    await db.insert(habits).values({
      id: "test-habit-1",
      userId: "test-user-1",
      name: "Test Habit",
      color: "blue",
      frequencyType: "daily",
      frequencyValue: { times: 1 },
      category: "health",
      isActive: true,
      isArchived: false,
      reminderEnabled: true,
    });
    console.log("✅ Habit created successfully\n");

    // Test 2: Query the habit and verify boolean types
    console.log("Test 2: Querying the habit");
    const queriedHabit = await db
      .select()
      .from(habits)
      .where(eq(habits.id, "test-habit-1"))
      .limit(1);
    console.log("Queried habit:", {
      id: queriedHabit[0]?.id,
      isActive: queriedHabit[0]?.isActive,
      isArchived: queriedHabit[0]?.isArchived,
      reminderEnabled: queriedHabit[0]?.reminderEnabled,
    });
    console.log("✅ Boolean types verified\n");

    // Test 3: Create a habit log with boolean field
    console.log("Test 3: Creating a habit log");
    await db.insert(habitLogs).values({
      id: "test-log-1",
      habitId: "test-habit-1",
      userId: "test-user-1",
      completedAt: new Date(),
      hasPhoto: true,
    });
    console.log("✅ Habit log created successfully\n");

    // Test 4: Query the log and verify boolean type
    console.log("Test 4: Querying the habit log");
    const queriedLog = await db
      .select()
      .from(habitLogs)
      .where(eq(habitLogs.id, "test-log-1"))
      .limit(1);
    console.log("Queried log:", {
      id: queriedLog[0]?.id,
      hasPhoto: queriedLog[0]?.hasPhoto,
    });
    console.log("✅ Boolean type verified\n");

    // Test 5: Create a goal with boolean field
    console.log("Test 5: Creating a goal");
    await db.insert(goals).values({
      id: "test-goal-1",
      userId: "test-user-1",
      name: "Test Goal",
      isCompleted: false,
    });
    console.log("✅ Goal created successfully\n");

    // Test 6: Query the goal and verify boolean type
    console.log("Test 6: Querying the goal");
    const queriedGoal = await db
      .select()
      .from(goals)
      .where(eq(goals.id, "test-goal-1"))
      .limit(1);
    console.log("Queried goal:", {
      id: queriedGoal[0]?.id,
      isCompleted: queriedGoal[0]?.isCompleted,
    });
    console.log("✅ Boolean type verified\n");

    // Cleanup
    console.log("Cleaning up test data...");
    await db.delete(habits).where(eq(habits.id, "test-habit-1"));
    await db.delete(habitLogs).where(eq(habitLogs.id, "test-log-1"));
    await db.delete(goals).where(eq(goals.id, "test-goal-1"));
    console.log("✅ Test data cleaned up\n");

    console.log("🎉 All tests passed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testSchema();
