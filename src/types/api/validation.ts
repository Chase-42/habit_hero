import type { Habit, Goal, HabitLog } from "../models";

/**
 * Validation error response type
 */
export type ValidationError = {
  field: string;
  message: string;
};

/**
 * API error response type
 */
export type ApiError = {
  code: string;
  message: string;
  details?: ValidationError[];
};

/**
 * API response wrapper type
 */
export type ApiResponse<T> = {
  data: T;
  error?: ApiError;
};

/**
 * Pagination parameters
 */
export type PaginationParams = {
  page?: number;
  limit?: number;
  cursor?: string;
};

/**
 * Paginated response type
 */
export type PaginatedResponse<T> = ApiResponse<T> & {
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    nextCursor?: string;
  };
};
