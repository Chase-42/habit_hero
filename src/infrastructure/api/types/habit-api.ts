export interface HabitApi {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  color: string;
  frequencyType: string;
  frequencyValue: number;
  streak: number;
  longestStreak: number;
  createdAt: string;
  updatedAt: string;
  completedToday: boolean;
  lastCompletedAt?: string;
  reminderTime?: string;
  isArchived: boolean;
}

export interface CreateHabitApiRequest {
  title: string;
  description?: string;
  category: string;
  color: string;
  frequencyType: string;
  frequencyValue: number;
  reminderTime?: string;
}

export interface UpdateHabitApiRequest {
  title?: string;
  description?: string;
  category?: string;
  color?: string;
  frequencyType?: string;
  frequencyValue?: number;
  reminderTime?: string;
}

export interface HabitApiResponse {
  data: HabitApi;
  message: string;
}

export interface HabitListApiResponse {
  data: HabitApi[];
  message: string;
}
