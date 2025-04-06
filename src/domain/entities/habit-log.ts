import { ValidationError } from "../errors/validation-error";

export class HabitLog {
  private constructor(
    public readonly id: string,
    public readonly habitId: string,
    public readonly userId: string,
    public readonly completedAt: Date,
    public readonly value: number | null,
    public readonly notes: string | null,
    public readonly details: Record<string, unknown> | null,
    public readonly difficulty: number | null,
    public readonly feeling: string | null,
    public readonly hasPhoto: boolean,
    public readonly photoUrl: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(params: {
    habitId: string;
    userId: string;
    value?: number;
    notes?: string;
    details?: Record<string, unknown>;
    difficulty?: number;
    feeling?: string;
    hasPhoto?: boolean;
    photoUrl?: string;
  }): HabitLog {
    // Validate difficulty if provided
    if (
      params.difficulty !== undefined &&
      (params.difficulty < 1 || params.difficulty > 5)
    ) {
      throw new ValidationError("Difficulty must be between 1 and 5");
    }

    // Validate value if provided
    if (params.value !== undefined && params.value < 0) {
      throw new ValidationError("Value cannot be negative");
    }

    return new HabitLog(
      crypto.randomUUID(),
      params.habitId,
      params.userId,
      new Date(),
      params.value ?? null,
      params.notes ?? null,
      params.details ?? null,
      params.difficulty ?? null,
      params.feeling ?? null,
      params.hasPhoto ?? false,
      params.photoUrl ?? null,
      new Date(),
      new Date()
    );
  }

  static fromDb(params: {
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
  }): HabitLog {
    return new HabitLog(
      params.id,
      params.habitId,
      params.userId,
      params.completedAt,
      params.value,
      params.notes,
      params.details,
      params.difficulty,
      params.feeling,
      params.hasPhoto,
      params.photoUrl,
      params.createdAt,
      params.updatedAt
    );
  }

  update(params: {
    value?: number;
    notes?: string;
    details?: Record<string, unknown>;
    difficulty?: number;
    feeling?: string;
    hasPhoto?: boolean;
    photoUrl?: string;
  }): HabitLog {
    return new HabitLog(
      this.id,
      this.habitId,
      this.userId,
      this.completedAt,
      params.value ?? this.value,
      params.notes ?? this.notes,
      params.details ?? this.details,
      params.difficulty ?? this.difficulty,
      params.feeling ?? this.feeling,
      params.hasPhoto ?? this.hasPhoto,
      params.photoUrl ?? this.photoUrl,
      this.createdAt,
      new Date()
    );
  }
}
