type HabitColor = "blue" | "red" | "green" | "purple" | "yellow" | "pink" | "indigo" | "teal";

interface Habit {
  id: string;
  name: string;
  color: HabitColor;
  frequency: "daily" | "weekdays" | "custom";
  category: string;
  streak: number;
  completedDates?: string[];
  days?: number[] | null;
  goal?: string;
  notes?: string;
  reminder?: string;
  createdAt?: Date;
}

const generateRandomDates = (count: number, streak: number): string[] => {
  const dates: string[] = [];
  const today = new Date();

  // Add streak days (consecutive days including today)
  for (let i = 0; i < streak; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    if (dateStr) dates.push(dateStr);
  }

  // Add random dates from the past 30 days
  for (let i = 0; i < count - streak; i++) {
    const randomDaysAgo = Math.floor(Math.random() * 30) + streak;
    const date = new Date(today);
    date.setDate(date.getDate() - randomDaysAgo);
    const dateStr = date.toISOString().split("T")[0];
    if (dateStr && !dates.includes(dateStr)) {
      dates.push(dateStr);
    }
  }

  return dates;
}

export const mockHabits: Habit[] = [
  {
    id: "1",
    name: "Morning Run",
    category: "fitness",
    frequency: "daily",
    days: null,
    reminder: "06:30",
    color: "red",
    goal: "Run 5km every morning",
    notes: "Focus on maintaining a steady pace and proper breathing technique.",
    streak: 5,
    completedDates: generateRandomDates(15, 5),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    name: "Meditation",
    category: "mindfulness",
    frequency: "daily",
    days: null,
    reminder: "07:15",
    color: "purple",
    goal: "Meditate for 10 minutes daily",
    notes: "Use the guided meditation app and focus on breathing.",
    streak: 12,
    completedDates: generateRandomDates(25, 12),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    name: "Drink Water",
    category: "health",
    frequency: "daily",
    days: null,
    reminder: "09:00",
    color: "blue",
    goal: "Drink 8 glasses of water daily",
    notes: "Keep a water bottle at desk and set hourly reminders.",
    streak: 8,
    completedDates: generateRandomDates(20, 8),
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
  },
  {
    id: "4",
    name: "Read 30 minutes",
    category: "productivity",
    frequency: "weekdays",
    days: null,
    reminder: "21:00",
    color: "green",
    goal: "Read 30 minutes before bed on weekdays",
    notes: "Currently reading 'Atomic Habits' by James Clear.",
    streak: 3,
    completedDates: generateRandomDates(12, 3),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  {
    id: "5",
    name: "Stretching",
    category: "fitness",
    frequency: "custom",
    days: [1, 3, 5], // Monday, Wednesday, Friday
    reminder: "18:00",
    color: "yellow",
    goal: "Do 15 minutes of stretching",
    notes: "Focus on hamstrings and lower back.",
    streak: 1,
    completedDates: generateRandomDates(8, 1),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
  {
    id: "6",
    name: "Journal",
    category: "mindfulness",
    frequency: "daily",
    days: null,
    reminder: "22:00",
    color: "pink",
    goal: "Write in journal for 10 minutes",
    notes: "Focus on gratitude and daily achievements.",
    streak: 0,
    completedDates: generateRandomDates(10, 0),
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
  },
  {
    id: "7",
    name: "No Social Media",
    category: "productivity",
    frequency: "weekdays",
    days: null,
    reminder: "08:00",
    color: "indigo",
    goal: "Avoid social media during work hours",
    notes: "Use app blockers if necessary.",
    streak: 2,
    completedDates: generateRandomDates(7, 2),
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
  },
  {
    id: "8",
    name: "Take Vitamins",
    category: "health",
    frequency: "daily",
    days: null,
    reminder: "08:30",
    color: "teal",
    goal: "Take daily multivitamin with breakfast",
    notes: "Keep vitamins next to coffee maker as a reminder.",
    streak: 15,
    completedDates: generateRandomDates(28, 15),
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
  },
]

