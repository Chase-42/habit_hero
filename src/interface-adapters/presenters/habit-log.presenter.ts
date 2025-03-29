import type {
  HabitLog,
  CreateHabitLog,
  UpdateHabitLog,
} from "~/entities/models/habit-log";
import type { Result } from "~/application/types";
import type { ValidationError, NotFoundError } from "~/entities/errors";

export interface HabitLogResponse {
  id: string;
  habitId: string;
  userId: string;
  value?: number;
  notes?: string;
  details?: {
    duration?: number;
    distance?: number;
    sets?: number;
    reps?: number;
    weight?: number;
    intensity?: number;
    customFields?: Record<string, string | number | boolean>;
  };
  difficulty?: number;
  feeling?: string;
  hasPhoto: boolean;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitLogRequest {
  value?: number;
  notes?: string;
  details?: {
    duration?: number;
    distance?: number;
    sets?: number;
    reps?: number;
    weight?: number;
    intensity?: number;
    customFields?: Record<string, string | number | boolean>;
  };
  difficulty?: number;
  feeling?: string;
}

export interface UpdateHabitLogRequest extends Partial<CreateHabitLogRequest> {}

export class HabitLogPresenter {
  static toResponse(log: HabitLog): HabitLogResponse {
    return {
      id: log.id,
      habitId: log.habitId,
      userId: log.userId,
      value: log.value,
      notes: log.notes,
      details: log.details,
      difficulty: log.difficulty,
      feeling: log.feeling,
      hasPhoto: log.hasPhoto,
      completedAt: log.completedAt.toISOString(),
      createdAt: log.createdAt.toISOString(),
      updatedAt: log.updatedAt.toISOString(),
    };
  }

  static toCreateRequest(
    data: CreateHabitLogRequest,
    habitId: string,
    userId: string
  ): CreateHabitLog {
    return {
      habitId,
      userId,
      value: data.value,
      notes: data.notes,
      details: data.details,
      difficulty: data.difficulty,
      feeling: data.feeling,
      hasPhoto: false,
      completedAt: new Date(),
    };
  }

  static toUpdateRequest(data: UpdateHabitLogRequest): UpdateHabitLog {
    return {
      value: data.value,
      notes: data.notes,
      details: data.details,
      difficulty: data.difficulty,
      feeling: data.feeling,
    };
  }

  static fromResponse(response: HabitLogResponse): HabitLog {
    return {
      id: response.id,
      habitId: response.habitId,
      userId: response.userId,
      value: response.value,
      notes: response.notes,
      details: response.details,
      difficulty: response.difficulty,
      feeling: response.feeling,
      hasPhoto: response.hasPhoto,
      completedAt: new Date(response.completedAt),
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
    };
  }

  static toErrorResponse(
    error: ValidationError | NotFoundError
  ): Result<never, ValidationError | NotFoundError> {
    return {
      ok: false,
      error,
    };
  }
}
