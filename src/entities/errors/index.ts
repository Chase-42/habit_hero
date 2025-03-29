export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends Error {
  readonly _tag = "ValidationError";
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  readonly _tag = "NotFoundError";
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`);
    this.name = "NotFoundError";
  }
}

export class AuthorizationError extends DomainError {
  readonly _tag = "AuthorizationError" as const;
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class BusinessRuleError extends DomainError {
  readonly _tag = "BusinessRuleError" as const;
  constructor(message: string) {
    super(message);
    this.name = "BusinessRuleError";
  }
}

export class RepositoryError extends DomainError {
  readonly _tag = "RepositoryError" as const;
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

export class DatabaseError extends Error {
  readonly _tag = "DatabaseError";
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class UnauthorizedError extends DomainError {
  readonly _tag = "UnauthorizedError" as const;
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}
