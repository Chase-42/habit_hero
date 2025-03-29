import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ValidationError,
  NotFoundError,
  RepositoryError,
} from "../../entities/errors";

export function errorHandler(error: unknown) {
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: error.message, code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json(
      { error: error.message, code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  if (error instanceof RepositoryError) {
    console.error("Repository error:", error);
    return NextResponse.json(
      { error: "Database error", code: "REPOSITORY_ERROR" },
      { status: 500 }
    );
  }

  console.error("Unexpected error:", error);
  return NextResponse.json(
    { error: "Internal server error", code: "INTERNAL_ERROR" },
    { status: 500 }
  );
}

type NextApiHandler = (request: Request) => Promise<Response>;

export const withErrorHandler = (handler: NextApiHandler): NextApiHandler => {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof Error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ error: "An unknown error occurred" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  };
};
