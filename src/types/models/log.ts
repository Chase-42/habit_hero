import type { UserOwned, HabitDetails } from "../common/utils";

export interface HabitLog extends UserOwned {
  id: string;
  habitId: string;
  completedAt: Date;
  value: number | null;
  notes: string | null;
  details: HabitDetails | null;
  difficulty: number | null;
  feeling: string | null;
  hasPhoto: boolean;
  photoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompletionSummary {
  date: Date;
  count: number;
  details: HabitLog[];
}

export interface StreakSummary {
  date: Date;
  streak: number;
  wasStreakBroken: boolean;
}
