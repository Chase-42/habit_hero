import {
  int,
  text,
  index,
  singlestoreTableCreator,
  timestamp,
  boolean,
} from "drizzle-orm/singlestore-core";
import type { DB_HabitRow, DB_HabitLogRow } from "./types";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = singlestoreTableCreator(
  (name) => `habit_hero_${name}`
);

// Main habits table
export const habits_table = createTable(
  "habits_table",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category").notNull(),
    color: text("color").notNull(),
    icon: text("icon").notNull(),
    frequencyType: text("frequencyType").notNull(),
    frequencyValue: text("frequencyValue").notNull(),
    streak: int("streak").notNull().default(0),
    longestStreak: int("longestStreak").notNull().default(0),
    isCompleted: boolean("isCompleted").notNull().default(false),
    isActive: boolean("isActive").notNull().default(true),
    isArchived: boolean("isArchived").notNull().default(false),
    lastCompleted: timestamp("lastCompleted"),
    notes: text("notes"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (t) => [
    index("userId_idx").on(t.userId),
    index("category_idx").on(t.category),
  ]
);

// Habit logs table
export const habit_logs_table = createTable(
  "habit_logs_table",
  {
    id: text("id").primaryKey(),
    habitId: text("habitId").notNull(),
    userId: text("userId").notNull(),
    completedAt: timestamp("completedAt").notNull(),
    value: int("value"),
    notes: text("notes"),
    details: text("details"),
    difficulty: int("difficulty"),
    feeling: text("feeling"),
    hasPhoto: boolean("hasPhoto").notNull().default(false),
    photoUrl: text("photoUrl"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (t) => [
    index("habitId_idx").on(t.habitId),
    index("userId_idx").on(t.userId),
    index("completedAt_idx").on(t.completedAt),
  ]
);

// Goals table
export const goals_table = createTable(
  "goals_table",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    notes: text("notes"),
    isCompleted: boolean("isCompleted").notNull().default(false),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (t) => [index("userId_idx").on(t.userId)]
);

// Type exports
export type DB_HabitType = DB_HabitRow;
export type DB_HabitLogType = DB_HabitLogRow;

// Insert types
export type NewDB_Habit = typeof habits_table.$inferInsert;
export type NewDB_HabitLog = typeof habit_logs_table.$inferInsert;
