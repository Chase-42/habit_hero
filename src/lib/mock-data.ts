import type { Habit } from "~/types";

export const mockHabits: Habit[] = [
  {
    id: "1",
    name: "Exercise",
    color: "green",
    frequency: "daily",
    category: "Health",
    streak: 3,
    completedDates: ["2024-03-18", "2024-03-19", "2024-03-20"],
    days: [1, 2, 3, 4, 5],
    goal: 30,
    notes: "30 minutes of cardio",
    reminder: "08:00",
    createdAt: new Date("2024-03-15"),
  },
  {
    id: "2",
    name: "Read",
    color: "blue",
    frequency: "daily",
    category: "Learning",
    streak: 5,
    completedDates: ["2024-03-16", "2024-03-17", "2024-03-18", "2024-03-19", "2024-03-20"],
    goal: 20,
    notes: "Read for 20 minutes",
    createdAt: new Date("2024-03-15"),
  },
  {
    id: "3",
    name: "Meditate",
    color: "purple",
    frequency: "weekdays",
    category: "Mindfulness",
    streak: 2,
    completedDates: ["2024-03-19", "2024-03-20"],
    days: [1, 2, 3, 4, 5],
    goal: 10,
    reminder: "07:00",
    createdAt: new Date("2024-03-18"),
  },
];

