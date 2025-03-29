import type { Goal } from "~/entities/models/goal";
import type { ValidationError, NotFoundError } from "~/entities/errors";
import { NextResponse } from "next/server";

export interface GoalResponse {
  id: string;
  name: string;
  description: string | null;
  notes: string | null;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ErrorResponse {
  error: string;
}

export class GoalPresenter {
  static toResponse(goal: Goal): NextResponse<GoalResponse> {
    return NextResponse.json({
      id: goal.id.toString(),
      name: goal.title,
      description: goal.description,
      notes: goal.notes,
      isCompleted: goal.isCompleted,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    });
  }

  static toErrorResponse(
    error: ValidationError | NotFoundError
  ): NextResponse<ErrorResponse> {
    return NextResponse.json(
      { error: error.message },
      { status: error.name === "NotFoundError" ? 404 : 400 }
    );
  }

  static toDeleteResponse(): NextResponse<{ success: true }> {
    return NextResponse.json({ success: true });
  }
}
