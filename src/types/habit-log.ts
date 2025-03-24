export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  completedAt: Date;
  value: number | null;
  notes: string | null;
  details: Record<string, unknown> | null;
  difficulty: number | null;
  feeling: string | null;
  hasPhoto: boolean;
  photoUrl: string | null;
}

export type CompletionSummary = {
  date: Date;
  count: number;
  details: HabitLog[];
};

export type StreakSummary = {
  date: Date;
  streak: number;
  wasStreakBroken: boolean;
};
