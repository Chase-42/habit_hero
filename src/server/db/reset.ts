import { db } from ".";
import { sql } from "drizzle-orm";

async function resetDatabase() {
  try {
    // Drop existing tables
    await db.execute(sql`DROP TABLE IF EXISTS goals, habits, habit_logs;`);
    
    console.log("Tables dropped successfully");
    
    // The db:push command will recreate the tables with the new schema
    console.log("Now run 'npm run db:push' to recreate the tables");
    
    process.exit(0);
  } catch (error) {
    console.error("Error resetting database:", error);
    process.exit(1);
  }
}

void resetDatabase(); 