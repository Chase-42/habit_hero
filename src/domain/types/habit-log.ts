/**
 * Core domain type for a HabitLog entity
 */
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
  createdAt: Date;
  updatedAt: Date;
}
