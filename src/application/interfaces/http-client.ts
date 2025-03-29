import type { Result } from "../types";
import type { ValidationError, NotFoundError } from "../errors";

export interface IHttpClient {
  get<T>(url: string): Promise<Result<T, NotFoundError>>;
  post<T>(url: string, data: unknown): Promise<Result<T, ValidationError>>;
  put<T>(
    url: string,
    data: unknown
  ): Promise<Result<T, ValidationError | NotFoundError>>;
  delete(url: string): Promise<Result<void, NotFoundError>>;
}
