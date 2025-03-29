import { injectable } from "tsyringe";
import type { IHttpClient } from "~/application/interfaces/http-client";
import type { Result } from "~/application/types";
import { ValidationError, NotFoundError } from "~/entities/errors";
import { HabitMapper } from "~/infrastructure/mappers/habit-mapper";
import {
  apiHabitResponseSchema,
  apiHabitLogResponseSchema,
  apiCompletionSummaryResponseSchema,
  apiStreakSummaryResponseSchema,
  type ApiHabitResponse,
  type ApiHabitLogResponse,
  type ApiCompletionSummaryResponse,
  type ApiStreakSummaryResponse,
} from "~/application/dtos/habit";

@injectable()
export class FetchClient implements IHttpClient {
  private readonly mapper = new HabitMapper();

  async get<T>(url: string): Promise<Result<T, NotFoundError>> {
    const response = await fetch(url);
    if (!response.ok) {
      return { ok: false, error: new NotFoundError("Resource", url) };
    }
    const data = (await response.json()) as unknown;

    // Validate response based on URL pattern
    if (url.includes("/api/habits") && !url.includes("/logs")) {
      const validated = apiHabitResponseSchema.safeParse(data);
      if (!validated.success) {
        return { ok: false, error: new NotFoundError("Habit", url) };
      }
      return { ok: true, value: this.mapper.toDomain(validated.data) as T };
    }

    if (url.includes("/api/habits/logs")) {
      const validated = apiHabitLogResponseSchema.safeParse(data);
      if (!validated.success) {
        return { ok: false, error: new NotFoundError("HabitLog", url) };
      }
      return { ok: true, value: this.mapper.toDomainLog(validated.data) as T };
    }

    if (url.includes("/api/habits/analytics")) {
      if (url.includes("type=completion")) {
        const validated = apiCompletionSummaryResponseSchema.safeParse(data);
        if (!validated.success) {
          return { ok: false, error: new NotFoundError("Analytics", url) };
        }
        return {
          ok: true,
          value: this.mapper.toDomainCompletion(validated.data) as T,
        };
      }

      if (url.includes("type=streak")) {
        const validated = apiStreakSummaryResponseSchema.safeParse(data);
        if (!validated.success) {
          return { ok: false, error: new NotFoundError("Analytics", url) };
        }
        return {
          ok: true,
          value: this.mapper.toDomainStreak(validated.data) as T,
        };
      }
    }

    return { ok: true, value: data as T };
  }

  async post<T>(
    url: string,
    data: unknown
  ): Promise<Result<T, ValidationError>> {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      return {
        ok: false,
        error: new ValidationError("Failed to create resource"),
      };
    }
    const result = (await response.json()) as unknown;

    if (url.includes("/api/habits/logs")) {
      const validated = apiHabitLogResponseSchema.safeParse(result);
      if (!validated.success) {
        return {
          ok: false,
          error: new ValidationError("Invalid habit log data"),
        };
      }
      return { ok: true, value: this.mapper.toDomainLog(validated.data) as T };
    }

    return { ok: true, value: result as T };
  }

  async put<T>(
    url: string,
    data: unknown
  ): Promise<Result<T, ValidationError | NotFoundError>> {
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      return { ok: false, error: new NotFoundError("Resource", url) };
    }
    const result = (await response.json()) as unknown;

    if (url.includes("/api/habits/")) {
      const validated = apiHabitResponseSchema.safeParse(result);
      if (!validated.success) {
        return { ok: false, error: new ValidationError("Invalid habit data") };
      }
      return { ok: true, value: this.mapper.toDomain(validated.data) as T };
    }

    return { ok: true, value: result as T };
  }

  async delete(url: string): Promise<Result<void, NotFoundError>> {
    const response = await fetch(url, {
      method: "DELETE",
    });
    if (!response.ok) {
      return { ok: false, error: new NotFoundError("Resource", url) };
    }
    return { ok: true, value: undefined };
  }
}
