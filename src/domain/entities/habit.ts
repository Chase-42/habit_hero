import {
  type FrequencyType,
  type HabitCategory,
  type HabitColor,
} from "../enums";
import type { FrequencyValue } from "../utils/frequency";
import { ValidationError } from "../errors/validation-error";

export class Habit {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly category: HabitCategory,
    public readonly color: HabitColor,
    public readonly frequencyType: FrequencyType,
    public readonly frequencyValue: FrequencyValue,
    public readonly streak: number,
    public readonly longestStreak: number,
    public readonly isActive: boolean,
    public readonly isArchived: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly subCategory: string | null,
    public readonly lastCompleted: Date | null,
    public readonly goal: number | null,
    public readonly metricType: string | null,
    public readonly units: string | null,
    public readonly notes: string | null,
    public readonly reminder: Date | null,
    public readonly reminderEnabled: boolean
  ) {}

  static create(params: {
    userId: string;
    name: string;
    description?: string;
    category: HabitCategory;
    color: HabitColor;
    frequencyType: FrequencyType;
    frequencyValue: FrequencyValue;
    subCategory?: string;
    goal?: number;
    metricType?: string;
    units?: string;
    notes?: string;
    reminder?: Date;
    reminderEnabled?: boolean;
  }): Habit {
    // Validate name
    if (params.name.length < 3) {
      throw new ValidationError(
        "Habit name must be at least 3 characters long"
      );
    }

    if (params.name.length > 50) {
      throw new ValidationError(
        "Habit name must be at most 50 characters long"
      );
    }

    return new Habit(
      crypto.randomUUID(),
      params.userId,
      params.name,
      params.description ?? null,
      params.category,
      params.color,
      params.frequencyType,
      params.frequencyValue,
      0, // initial streak
      0, // initial longest streak
      true, // isActive
      false, // isArchived
      new Date(), // createdAt
      new Date(), // updatedAt
      params.subCategory ?? null,
      null, // lastCompleted
      params.goal ?? null,
      params.metricType ?? null,
      params.units ?? null,
      params.notes ?? null,
      params.reminder ?? null,
      params.reminderEnabled ?? false
    );
  }

  static fromDb(params: {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    category: HabitCategory;
    color: HabitColor;
    frequencyType: FrequencyType;
    frequencyValue: FrequencyValue;
    streak: number;
    longestStreak: number;
    isActive: boolean;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
    subCategory: string | null;
    lastCompleted: Date | null;
    goal: number | null;
    metricType: string | null;
    units: string | null;
    notes: string | null;
    reminder: Date | null;
    reminderEnabled: boolean;
  }): Habit {
    // Validate name
    if (params.name.length < 3) {
      throw new ValidationError(
        "Habit name must be at least 3 characters long"
      );
    }

    if (params.name.length > 50) {
      throw new ValidationError(
        "Habit name must be at most 50 characters long"
      );
    }

    return new Habit(
      params.id,
      params.userId,
      params.name,
      params.description,
      params.category,
      params.color,
      params.frequencyType,
      params.frequencyValue,
      params.streak,
      params.longestStreak,
      params.isActive,
      params.isArchived,
      params.createdAt,
      params.updatedAt,
      params.subCategory,
      params.lastCompleted,
      params.goal,
      params.metricType,
      params.units,
      params.notes,
      params.reminder,
      params.reminderEnabled
    );
  }

  complete(completedAt: Date = new Date()): Habit {
    return new Habit(
      this.id,
      this.userId,
      this.name,
      this.description,
      this.category,
      this.color,
      this.frequencyType,
      this.frequencyValue,
      this.streak + 1,
      Math.max(this.longestStreak, this.streak + 1),
      this.isActive,
      this.isArchived,
      this.createdAt,
      new Date(),
      this.subCategory,
      completedAt,
      this.goal,
      this.metricType,
      this.units,
      this.notes,
      this.reminder,
      this.reminderEnabled
    );
  }

  update(params: {
    name?: string;
    description?: string;
    category?: HabitCategory;
    color?: HabitColor;
    frequencyType?: FrequencyType;
    frequencyValue?: FrequencyValue;
    subCategory?: string;
    goal?: number;
    metricType?: string;
    units?: string;
    notes?: string;
    reminder?: Date;
    reminderEnabled?: boolean;
    isActive?: boolean;
    isArchived?: boolean;
  }): Habit {
    return new Habit(
      this.id,
      this.userId,
      params.name ?? this.name,
      params.description ?? this.description,
      params.category ?? this.category,
      params.color ?? this.color,
      params.frequencyType ?? this.frequencyType,
      params.frequencyValue ?? this.frequencyValue,
      this.streak,
      this.longestStreak,
      params.isActive ?? this.isActive,
      params.isArchived ?? this.isArchived,
      this.createdAt,
      new Date(),
      params.subCategory ?? this.subCategory,
      this.lastCompleted,
      params.goal ?? this.goal,
      params.metricType ?? this.metricType,
      params.units ?? this.units,
      params.notes ?? this.notes,
      params.reminder ?? this.reminder,
      params.reminderEnabled ?? this.reminderEnabled
    );
  }
}
