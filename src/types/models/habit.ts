import type { BaseEntity, UserOwned, FrequencyValue } from "../common/utils";
import type {
  HabitColor,
  FrequencyType,
  HabitCategory,
  SortField,
  SortOrder,
} from "../common/enums";

export interface Habit extends BaseEntity, UserOwned {
  name: string;
  color: HabitColor;
  frequencyType: FrequencyType;
  frequencyValue: FrequencyValue;
  category: HabitCategory;
  streak: number;
  longestStreak: number;
  isActive: boolean;
  isArchived: boolean;
  description: string | null;
  subCategory: string | null;
  lastCompleted: Date | null;
  goal: number | null;
  metricType: string | null;
  units: string | null;
  notes: string | null;
  reminder: Date | null;
  reminderEnabled: boolean;
}

export interface HabitFilters extends UserOwned {
  isActive?: boolean;
  isArchived?: boolean;
  category?: HabitCategory;
  searchQuery?: string;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}
