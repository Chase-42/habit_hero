import { 
  int, 
  text, 
  singlestoreTable, 
  timestamp,
  boolean,
  json,
  index,
  uniqueIndex
} from "drizzle-orm/singlestore-core";
import type { FrequencyValue, HabitColor, HabitCategory, FrequencyType, HabitDetails } from "~/types";

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
    reminderEnabled: boolean("reminderEnabled"),
  },
  (table) => [
    index("userId_idx").on(table.userId),
    index("category_idx").on(table.category)
  ]
);

// For tracking individual habit completions
export const habitLogs = singlestoreTable(
  "habit_hero_habit_logs",
  {
    // Required fields
    id: text("id").primaryKey(),
    habitId: text("habitId").notNull(),
    userId: text("userId").notNull(),
    completedAt: timestamp("completedAt").notNull().defaultNow(),
    hasPhoto: boolean("hasPhoto").notNull().default(false),
    // Optional fields
    value: int("value"),
    notes: text("notes"),
    details: json("details").$type<HabitDetails>(),
    difficulty: int("difficulty"),
    feeling: text("feeling"),
    photoUrl: text("photoUrl"),
  },
  (table) => [
    index("habitId_idx").on(table.habitId),
    index("userId_idx").on(table.userId),
    index("completedAt_idx").on(table.completedAt)
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
    targetDate: timestamp("targetDate"),
    isCompleted: boolean("isCompleted").default(false),
    category: text("category"),
    metricType: text("metricType"),
    startValue: int("startValue"),
    currentValue: int("currentValue"),
    targetValue: int("targetValue"),
    units: text("units"),
    relatedHabits: json("relatedHabits"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
  },
  (table) => [
    index("userId_idx").on(table.userId)
  ]
);