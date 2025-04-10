import { logger } from "~/lib/logger";
import type { ApiResponse, ApiError } from "~/types/api/validation";

const errorLogger = logger.withNamespace("error");

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: { field: string; message: string }[]
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const handleApiError = (error: unknown): never => {
  if (error instanceof AppError) {
    errorLogger.error("API Error", { context: error.code, data: error });
    throw error;
  }

  if (error instanceof Error) {
    errorLogger.error("Unexpected error", {
      context: "UNEXPECTED_ERROR",
      data: error,
    });
    throw new AppError(error.message, "UNEXPECTED_ERROR");
  }

  errorLogger.error("Unknown error occurred", { context: "UNKNOWN_ERROR" });
  throw new AppError("An unknown error occurred", "UNKNOWN_ERROR");
};

export const validateApiResponse = <T>(response: ApiResponse<T>): T => {
  if (response.error) {
    errorLogger.error("API Response Error", {
      context: response.error.code,
      data: response.error,
    });
    throw new AppError(
      response.error.message,
      response.error.code,
      response.error.details
    );
  }

  if (!response.data) {
    errorLogger.error("No data in API response", { context: "NO_DATA" });
    throw new AppError("No data returned from API", "NO_DATA");
  }

  return response.data;
};

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};
