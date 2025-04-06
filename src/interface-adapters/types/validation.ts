export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export function isApiError(error: unknown): error is ApiError {
  return (
    error !== null &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as ApiError).message === "string"
  );
}

export function isApiResponse<T>(
  response: unknown
): response is ApiResponse<T> {
  return (
    response !== null &&
    typeof response === "object" &&
    ("data" in response || "error" in response)
  );
}
