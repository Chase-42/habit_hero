import {
  type ValidationError,
  type NotFoundError,
  type RepositoryError,
} from "../entities/errors";

export type DomainError = ValidationError | NotFoundError | RepositoryError;

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): { ok: true; value: T } => ({
  ok: true,
  value,
});

export const err = <E>(error: E): { ok: false; error: E } => ({
  ok: false,
  error,
});

export function isOk<T, E extends DomainError>(
  result: Result<T, E>
): result is { ok: true; value: T } {
  return result.ok;
}

export function isErr<T, E extends DomainError>(
  result: Result<T, E>
): result is { ok: false; error: E } {
  return !result.ok;
}

export function unwrap<T, E extends DomainError>(result: Result<T, E>): T {
  if (!result.ok) {
    throw result.error;
  }
  return result.value;
}

export function mapError<T, E extends DomainError, F extends DomainError>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> {
  if (result.ok) {
    return result as Result<T, F>;
  }
  return err(fn(result.error));
}

export function map<T, U, E extends DomainError>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (result.ok) {
    return ok(fn(result.value));
  }
  return result;
}
