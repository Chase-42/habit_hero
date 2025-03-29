import type {
  DbGoal,
  NewDbGoal,
  Goal,
  CreateGoal,
  UpdateGoal,
  GoalWithDefaults,
} from "~/entities/types/goal";
import { goalSchema } from "~/entities/types/goal";
import { ValidationError } from "~/entities/errors";

export class GoalMapper {
  static toDomain(dbGoal: DbGoal): Goal {
    // Convert database goal to domain goal with default values
    const domainGoal: GoalWithDefaults = {
      id: dbGoal.id,
      userId: dbGoal.userId,
      name: dbGoal.name,
      description: dbGoal.description,
      target: 0, // Default value
      progress: 0, // Default value
      startDate: new Date(), // Default value
      endDate: new Date(), // Default value
      isCompleted: dbGoal.isCompleted,
      createdAt: new Date(dbGoal.createdAt),
      updatedAt: new Date(dbGoal.updatedAt),
    };

    const result = goalSchema.safeParse(domainGoal);
    if (!result.success) {
      throw new ValidationError("Invalid goal data from database");
    }

    return result.data;
  }

  static toPersistence(goal: CreateGoal): NewDbGoal {
    const now = new Date();
    const dbGoal: NewDbGoal = {
      id: goal.id,
      userId: goal.userId,
      name: goal.name,
      description: goal.description,
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    };

    return dbGoal;
  }

  static toUpdate(goal: UpdateGoal): Partial<NewDbGoal> {
    const update: Partial<NewDbGoal> = {
      updatedAt: new Date(),
    };

    if (goal.name !== undefined) update.name = goal.name;
    if (goal.description !== undefined) update.description = goal.description;
    if (goal.isCompleted !== undefined) update.isCompleted = goal.isCompleted;

    return update;
  }
}
