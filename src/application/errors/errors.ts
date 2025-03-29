export class ValidationError extends Error {
  readonly _tag = "ValidationError" as const;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  readonly _tag = "NotFoundError" as const;
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class RepositoryError extends Error {
  readonly _tag = "RepositoryError" as const;
  constructor(message: string) {
    super(message);
    this.name = "RepositoryError";
  }
}
