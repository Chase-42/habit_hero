import {
  int,
  text,
  singlestoreTable,
  timestamp,
  tinyint,
  json,
  index,
  boolean,
} from "drizzle-orm/singlestore-core";
import type { FrequencyValue, HabitDetails } from "~/types";
import {
  type HabitColor,
  type FrequencyType,
  type HabitCategory,
} from "~/types/common/enums";

// Main habits table
export const habits = singlestoreTable(
  "habit_hero_habits",
  {
    // Required fields
    id: text("id").primaryKey(),
    userId: text("userId").notNull(), // To associate habits with specific users
    name: text("name").notNull(),
    color: text("color").$type<HabitColor>().notNull(),
    frequencyType: text("frequencyType").$type<FrequencyType>().notNull(), // daily, weekly, specific_days, etc.
    frequencyValue: json("frequencyValue").$type<FrequencyValue>().notNull(), // For storing complex frequency data like [1,3,5] for Mon,Wed,Fri
    category: text("category").$type<HabitCategory>().notNull(), // workout, nutrition, recovery, etc.
    streak: int("streak").notNull().default(0),
    longestStreak: int("longestStreak").notNull().default(0),
    isActive: boolean("isActive").notNull().default(true),
    isArchived: boolean("isArchived").notNull().default(false),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
    // Optional fields
    description: text("description"),
    subCategory: text("subCategory"), // More specific, like cardio, strength, etc.
    lastCompleted: timestamp("lastCompleted"),
    goal: int("goal"),
    metricType: text("metricType"), // weight, reps, distance, duration, etc.
    units: text("units"), // kg, miles, minutes, etc.
    notes: text("notes"),
    reminder: timestamp("reminder"),
    reminderEnabled: boolean("reminderEnabled").notNull().default(false),
  },
  (table) => [
    index("habits_userId_idx").on(table.userId),
    index("habits_category_idx").on(table.category),
  ]
);

// For tracking individual habit completions
// Table name: habit_hero_habit_logs
// This table is referenced as 'habitLogs' in our code
export const habitLogs = singlestoreTable(
  "habit_hero_habit_logs",
  {
    // Required fields
    id: text("id").primaryKey(),
    habitId: text("habitId").notNull(),
    userId: text("userId").notNull(),
    completedAt: timestamp("completedAt").notNull().defaultNow(),
    hasPhoto: boolean("hasPhoto").notNull().default(false),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
    // Optional fields
    value: int("value"),
    notes: text("notes"),
    details: json("details").$type<HabitDetails>(),
    difficulty: int("difficulty"),
    feeling: text("feeling"),
    photoUrl: text("photoUrl"),
  },
  (table) => [
    index("habitLogs_habitId_idx").on(table.habitId),
    index("habitLogs_userId_idx").on(table.userId),
    index("habitLogs_completedAt_idx").on(table.completedAt),
  ]
);

// Optional: For fitness goals
export const goals = singlestoreTable(
  "habit_hero_goals",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    notes: text("notes"),
    isCompleted: boolean("isCompleted").notNull().default(false),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => [index("goals_userId_idx").on(table.userId)]
);
