import { injectable } from "tsyringe";
import { db } from "../database";
import { goals_table } from "../database/schema";
import { eq } from "drizzle-orm";
import type { IGoalRepository } from "~/application/interfaces/repositories/goal-repository";
import type { Goal } from "~/entities/models/goal";
import type { Result } from "~/application/types";
import { NotFoundError, ValidationError } from "~/entities/errors";
import { ok, err } from "~/application/types";
import { v4 as uuidv4 } from "uuid";
import type { NewGoal } from "~/entities/types/form";

@injectable()
export class GoalRepository implements IGoalRepository {
  async findById(id: string): Promise<Result<Goal, NotFoundError>> {
    try {
      const result = await db
        .select()
        .from(goals_table)
        .where(eq(goals_table.id, id));

      const goal = result[0];
      if (!goal) {
        return err(new NotFoundError("Goal", id));
      }

      return ok({
        ...goal,
        isCompleted: Boolean(goal.isCompleted),
      });
    } catch (error) {
      return err(new NotFoundError("Goal", id));
    }
  }

  async findByUserId(userId: string): Promise<Result<Goal[], NotFoundError>> {
    try {
      const result = await db
        .select()
        .from(goals_table)
        .where(eq(goals_table.userId, userId));

      return ok(
        result.map((goal) => ({
          ...goal,
          isCompleted: Boolean(goal.isCompleted),
        }))
      );
    } catch (error) {
      return err(new NotFoundError("Goal", userId));
    }
  }

  async create(data: NewGoal): Promise<Result<Goal, ValidationError>> {
    try {
      const id = uuidv4();
      await db.insert(goals_table).values({
        id,
        userId: data.userId,
        title: data.name,
        description: data.description ?? "",
        notes: data.notes ?? "",
        isCompleted: data.isCompleted,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const findResult = await this.findById(id);
      if (!findResult.ok) {
        return err(new ValidationError("Failed to retrieve created goal"));
      }

      return ok(findResult.value);
    } catch (error) {
      return err(new ValidationError("Failed to create goal"));
    }
  }

  async update(
    id: string,
    data: Partial<Goal>
  ): Promise<Result<Goal, ValidationError | NotFoundError>> {
    try {
      const exists = await this.exists(id);
      if (!exists) {
        return err(new NotFoundError("Goal", id));
      }

      const updates: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (data.title !== undefined) updates.title = data.title;
      if (data.description !== undefined)
        updates.description = data.description;
      if (data.notes !== undefined) updates.notes = data.notes;
      if (data.isCompleted !== undefined)
        updates.isCompleted = data.isCompleted;

      await db.update(goals_table).set(updates).where(eq(goals_table.id, id));

      const findResult = await this.findById(id);
      if (!findResult.ok) {
        return err(new ValidationError("Failed to retrieve updated goal"));
      }

      return ok(findResult.value);
    } catch (error) {
      return err(new ValidationError("Failed to update goal"));
    }
  }

  async delete(id: string): Promise<Result<void, NotFoundError>> {
    try {
      const exists = await this.exists(id);
      if (!exists) {
        return err(new NotFoundError("Goal", id));
      }

      await db.delete(goals_table).where(eq(goals_table.id, id));
      return ok(void 0);
    } catch (error) {
      return err(new NotFoundError("Goal", id));
    }
  }

  async validate(goal: Partial<Goal>): Promise<Result<true, ValidationError>> {
    try {
      if (!goal.userId || !goal.title || !goal.description) {
        return err(new ValidationError("Missing required fields"));
      }

      const id = uuidv4();
      await db.insert(goals_table).values({
        id,
        userId: goal.userId,
        title: goal.title,
        description: goal.description,
        notes: goal.notes ?? "",
        isCompleted: goal.isCompleted ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return ok(true);
    } catch (error) {
      return err(new ValidationError("Invalid goal data"));
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const result = await db
        .select({ id: goals_table.id })
        .from(goals_table)
        .where(eq(goals_table.id, id))
        .limit(1);

      return result.length > 0;
    } catch (error) {
      return false;
    }
  }

  async isOwnedBy(id: string, userId: string): Promise<boolean> {
    try {
      const result = await db
        .select({ userId: goals_table.userId })
        .from(goals_table)
        .where(eq(goals_table.id, id))
        .limit(1);

      if (result.length === 0) {
        return false;
      }

      return result[0].userId === userId;
    } catch (error) {
      return false;
    }
  }

  async findAll(userId: string): Promise<Result<Goal[], NotFoundError>> {
    try {
      const result = await db
        .select()
        .from(goals_table)
        .where(eq(goals_table.userId, userId));

      return ok(
        result.map((goal) => ({
          ...goal,
          isCompleted: Boolean(goal.isCompleted),
        }))
      );
    } catch (error) {
      return err(new NotFoundError("Goal", userId));
    }
  }
}
