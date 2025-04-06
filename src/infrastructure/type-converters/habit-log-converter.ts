import type { HabitLog } from "~/domain/models/habit";
import type { HabitDetails } from "~/types";

export function toDomainHabitLog(dbLog: {
  id: string;
  habitId: string;
  userId: string;
  completedAt: Date;
  hasPhoto: boolean;
  createdAt: Date;
  updatedAt: Date;
  value?: number | null;
  notes?: string | null;
  details?: HabitDetails | null;
  difficulty?: number | null;
  feeling?: string | null;
  photoUrl?: string | null;
}): HabitLog {
  const log: HabitLog = {
    id: dbLog.id,
    habitId: dbLog.habitId,
    userId: dbLog.userId,
    completedAt: dbLog.completedAt,
    value: dbLog.value ?? null,
    notes: dbLog.notes ?? null,
    details: dbLog.details ?? null,
    difficulty: dbLog.difficulty ?? null,
    feeling: dbLog.feeling ?? null,
    hasPhoto: dbLog.hasPhoto,
    photoUrl: dbLog.photoUrl ?? null,
    createdAt: dbLog.createdAt,
    updatedAt: dbLog.updatedAt,
    update: function (params) {
      return {
        ...this,
        ...params,
        updatedAt: new Date(),
      };
    },
  };
  return log;
}

export function toDbHabitLog(log: HabitLog): {
  id: string;
  habitId: string;
  userId: string;
  completedAt: Date;
  hasPhoto: boolean;
  createdAt: Date;
  updatedAt: Date;
  value?: number | null;
  notes?: string | null;
  details?: HabitDetails | null;
  difficulty?: number | null;
  feeling?: string | null;
  photoUrl?: string | null;
} {
  return {
    id: log.id,
    habitId: log.habitId,
    userId: log.userId,
    completedAt: log.completedAt,
    hasPhoto: log.hasPhoto,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
    value: log.value,
    notes: log.notes,
    details: log.details,
    difficulty: log.difficulty,
    feeling: log.feeling,
    photoUrl: log.photoUrl,
  };
}
