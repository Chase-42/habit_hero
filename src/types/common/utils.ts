/**
 * Represents the frequency configuration for a habit
 */
export type FrequencyValue = {
  /** Array of days (0-6) for weekly frequency, where 0 represents Sunday */
  days?: number[];
  /** Number of times the habit should be completed per period */
  times?: number;
};

/**
 * Detailed information about a habit completion
 */
export type HabitDetails = {
  /** Duration in minutes */
  duration?: number;
  /** Distance in specified units */
  distance?: number;
  /** Number of sets */
  sets?: number;
  /** Number of repetitions */
  reps?: number;
  /** Weight in specified units */
  weight?: number;
  /** Intensity level on a scale of 1-10 */
  intensity?: number;
  /** Additional custom fields for specific habit types */
  customFields?: Record<string, string | number | boolean>;
};

/**
 * Base entity type with common fields
 */
export type BaseEntity = {
  /** Unique identifier */
  id: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
};

/**
 * Type for entities owned by a user
 */
export type UserOwned = {
  /** ID of the user who owns this entity */
  userId: string;
};
