import { sql } from "drizzle-orm";
import { habits_table } from "../schema";
import { db } from "../index";

export async function up() {
  await db.execute(sql`
    UPDATE ${habits_table}
    SET frequencyValue = CASE
      WHEN frequencyType = 'daily' THEN JSON_OBJECT('type', 'daily', 'times', 1)
      WHEN frequencyType = 'weekly' THEN JSON_OBJECT('type', 'weekly', 'daysOfWeek', JSON_ARRAY(1), 'times', 1)
      WHEN frequencyType = 'monthly' THEN JSON_OBJECT('type', 'monthly', 'daysOfMonth', JSON_ARRAY(1), 'times', 1)
      WHEN frequencyType = 'specific_days' THEN JSON_OBJECT('type', 'specific_days', 'days', JSON_ARRAY(), 'times', 1)
      ELSE frequencyValue
    END
    WHERE frequencyValue NOT LIKE '%"times":%'
  `);
}

export async function down() {
  // No down migration needed as this is a data fix
  return;
}
