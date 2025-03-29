import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  schema: "./src/infrastructure/database/schema.ts",
  dialect: "singlestore",
  tablesFilter: ["habit_hero_*"],
  dbCredentials: {
    host: env.SINGLESTORE_HOST,
    port: parseInt(env.SINGLESTORE_PORT),
    user: env.SINGLESTORE_USER,
    password: env.SINGLESTORE_PASS,
    database: env.SINGLESTORE_DB_NAME,
    ssl: {},
  },
} satisfies Config;
