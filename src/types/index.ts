export type HabitColor =
  | "red"
  | "green"
  | "blue"
  | "yellow"
  | "purple"
  | "pink"
  | "orange";

export interface Habit {
  id: string;
  name: string;
  color: HabitColor;
  frequency: string;
  category: string;
  streak: number;
  completedDates: string[];
  days?: number[];
  goal?: number;
  notes?: string;
  reminder?: string;
  createdAt: Date;
} 