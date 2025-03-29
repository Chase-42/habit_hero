import { injectable, inject } from "tsyringe";
import { NextResponse } from "next/server";
import type { Result } from "~/application/types";
import type {
  HabitLog,
  CompletionSummary,
  StreakSummary,
} from "~/entities/models/habit-log";
import { ValidationError, NotFoundError } from "~/entities/errors";
import type { AddHabitLogUseCase } from "~/application/use-cases/add-habit-log.use-case";
import type { GetHabitLogsUseCase } from "~/application/use-cases/get-habit-logs.use-case";
import type { DeleteHabitLogUseCase } from "~/application/use-cases/delete-habit-log.use-case";
import type { GetHabitAnalyticsUseCase } from "~/application/use-cases/get-habit-analytics.use-case";
import {
  HabitLogPresenter,
  type CreateHabitLogRequest,
} from "../presenters/habit-log.presenter";

@injectable()
export class HabitLogController {
  constructor(
    @inject("AddHabitLogUseCase")
    private readonly addHabitLogUseCase: AddHabitLogUseCase,
    @inject("GetHabitLogsUseCase")
    private readonly getHabitLogsUseCase: GetHabitLogsUseCase,
    @inject("DeleteHabitLogUseCase")
    private readonly deleteHabitLogUseCase: DeleteHabitLogUseCase,
    @inject("GetHabitAnalyticsUseCase")
    private readonly getHabitAnalyticsUseCase: GetHabitAnalyticsUseCase
  ) {}

  async create(request: Request): Promise<Response> {
    try {
      const body = (await request.json()) as {
        habitId: string;
        userId: string;
      } & Partial<CreateHabitLogRequest>;
      const { habitId, userId, ...requestData } = body;

      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!habitId) {
        return NextResponse.json(
          { error: "Habit ID is required" },
          { status: 400 }
        );
      }

      const logData = HabitLogPresenter.toCreateRequest(
        requestData,
        habitId,
        userId
      );
      const result = await this.addHabitLogUseCase.execute(
        habitId,
        userId,
        logData
      );

      if (!result.ok) {
        const errorResponse = HabitLogPresenter.toErrorResponse(result.error);
        const status = result.error instanceof NotFoundError ? 404 : 400;
        return NextResponse.json(errorResponse, { status });
      }

      const response = HabitLogPresenter.toResponse(result.value);
      return NextResponse.json(response, { status: 201 });
    } catch (error) {
      console.error("Error creating habit log:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  async getLogs(request: Request): Promise<Response> {
    try {
      const { searchParams } = new URL(request.url);
      const habitId = searchParams.get("habitId");
      const userId = searchParams.get("userId");
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!habitId) {
        return NextResponse.json(
          { error: "Habit ID is required" },
          { status: 400 }
        );
      }

      const result = await this.getHabitLogsUseCase.execute(
        habitId,
        userId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      if (!result.ok) {
        const errorResponse = HabitLogPresenter.toErrorResponse(result.error);
        const status = result.error instanceof NotFoundError ? 404 : 400;
        return NextResponse.json(errorResponse, { status });
      }

      const response = result.value.map((log) =>
        HabitLogPresenter.toResponse(log)
      );
      return NextResponse.json(response);
    } catch (error) {
      console.error("Error getting habit logs:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  async deleteLog(request: Request): Promise<Response> {
    try {
      const { searchParams } = new URL(request.url);
      const logId = searchParams.get("logId");
      const habitId = searchParams.get("habitId");
      const userId = searchParams.get("userId");

      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!logId || !habitId) {
        return NextResponse.json(
          { error: "Log ID and Habit ID are required" },
          { status: 400 }
        );
      }

      const result = await this.deleteHabitLogUseCase.execute(
        logId,
        habitId,
        userId
      );

      if (!result.ok) {
        const errorResponse = HabitLogPresenter.toErrorResponse(result.error);
        const status = result.error instanceof NotFoundError ? 404 : 400;
        return NextResponse.json(errorResponse, { status });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting habit log:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  async getCompletionSummaries(request: Request): Promise<Response> {
    try {
      const { searchParams } = new URL(request.url);
      const habitId = searchParams.get("habitId");
      const userId = searchParams.get("userId");
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");
      const groupBy = searchParams.get("groupBy") as
        | "day"
        | "week"
        | "month"
        | undefined;

      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!habitId) {
        return NextResponse.json(
          { error: "Habit ID is required" },
          { status: 400 }
        );
      }

      const result = await this.getHabitAnalyticsUseCase.getCompletionSummaries(
        habitId,
        userId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
        groupBy
      );

      if (!result.ok) {
        const errorResponse = HabitLogPresenter.toErrorResponse(result.error);
        const status = result.error instanceof NotFoundError ? 404 : 400;
        return NextResponse.json(errorResponse, { status });
      }

      return NextResponse.json(result.value);
    } catch (error) {
      console.error("Error getting completion summaries:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  async getStreakSummaries(request: Request): Promise<Response> {
    try {
      const { searchParams } = new URL(request.url);
      const habitId = searchParams.get("habitId");
      const userId = searchParams.get("userId");
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!habitId) {
        return NextResponse.json(
          { error: "Habit ID is required" },
          { status: 400 }
        );
      }

      const result = await this.getHabitAnalyticsUseCase.getStreakSummaries(
        habitId,
        userId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      if (!result.ok) {
        const errorResponse = HabitLogPresenter.toErrorResponse(result.error);
        const status = result.error instanceof NotFoundError ? 404 : 400;
        return NextResponse.json(errorResponse, { status });
      }

      return NextResponse.json(result.value);
    } catch (error) {
      console.error("Error getting streak summaries:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  async getCompletionRate(request: Request): Promise<Response> {
    try {
      const { searchParams } = new URL(request.url);
      const habitId = searchParams.get("habitId");
      const userId = searchParams.get("userId");
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!habitId) {
        return NextResponse.json(
          { error: "Habit ID is required" },
          { status: 400 }
        );
      }

      const result = await this.getHabitAnalyticsUseCase.getCompletionRate(
        habitId,
        userId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      if (!result.ok) {
        const errorResponse = HabitLogPresenter.toErrorResponse(result.error);
        const status = result.error instanceof NotFoundError ? 404 : 400;
        return NextResponse.json(errorResponse, { status });
      }

      return NextResponse.json({ rate: result.value });
    } catch (error) {
      console.error("Error getting completion rate:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  async getAverageDifficulty(request: Request): Promise<Response> {
    try {
      const { searchParams } = new URL(request.url);
      const habitId = searchParams.get("habitId");
      const userId = searchParams.get("userId");
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!habitId) {
        return NextResponse.json(
          { error: "Habit ID is required" },
          { status: 400 }
        );
      }

      const result = await this.getHabitAnalyticsUseCase.getAverageDifficulty(
        habitId,
        userId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      if (!result.ok) {
        const errorResponse = HabitLogPresenter.toErrorResponse(result.error);
        const status = result.error instanceof NotFoundError ? 404 : 400;
        return NextResponse.json(errorResponse, { status });
      }

      return NextResponse.json({ average: result.value });
    } catch (error) {
      console.error("Error getting average difficulty:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
}
