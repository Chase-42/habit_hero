import { db } from "../../database";
import fs from "fs";
import path from "path";

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, "fix_frequency_values.sql");
    const migration = fs.readFileSync(migrationPath, "utf-8");

    await db.execute(migration);
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

void runMigration();
