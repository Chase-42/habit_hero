export interface HabitLogApi {
  id: string;
  habitId: string;
  userId: string;
  completedAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitLogApiRequest {
  habitId: string;
  userId: string;
  notes?: string;
}

export interface UpdateHabitLogApiRequest {
  notes?: string;
}

export interface HabitLogApiResponse {
  data: HabitLogApi;
  message: string;
}

export interface HabitLogListApiResponse {
  data: HabitLogApi[];
  message: string;
}
