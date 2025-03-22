import { db } from ".";
import { sql } from "drizzle-orm";

async function dropTables() {
  try {
    await db.execute(sql`DROP TABLE IF EXISTS goals, habits, habit_logs;`);
    console.log("Tables dropped successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error dropping tables:", error);
    process.exit(1);
  }
}

void dropTables(); 