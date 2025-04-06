import type { HabitLog } from "~/domain/entities/habit-log";

export interface ApiHabitLog {
  id: string;
  habitId: string;
  userId: string;
  completedAt: string;
  value: number | null;
  notes: string | null;
  details: Record<string, unknown> | null;
  difficulty: number | null;
  feeling: string | null;
  hasPhoto: boolean;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  update: (params: Partial<ApiHabitLog>) => HabitLog;
}

export interface NewHabitLog {
  habitId: string;
  userId: string;
  value?: number;
  notes?: string;
  details?: Record<string, unknown>;
  difficulty?: number;
  feeling?: string;
  hasPhoto?: boolean;
  photoUrl?: string;
}
