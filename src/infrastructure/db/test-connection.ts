import { sql } from "drizzle-orm";
import { db } from "./connection";

async function testConnection() {
  try {
    // Try to execute a simple query
    await db.execute(sql`SELECT 1`);
    console.log("Database connection successful!");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

testConnection();
