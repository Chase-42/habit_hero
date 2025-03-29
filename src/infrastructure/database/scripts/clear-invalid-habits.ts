import { sql } from "drizzle-orm";
import { habits_table } from "../schema";
import { db } from "../index";

async function clearInvalidHabits() {
  try {
    await db.execute(sql`
      DELETE FROM ${habits_table}
      WHERE frequencyValue NOT LIKE '%"times":%'
    `);
    console.log("Successfully cleared invalid habits");
  } catch (error) {
    console.error("Failed to clear invalid habits:", error);
    process.exit(1);
  }
}

void clearInvalidHabits();
