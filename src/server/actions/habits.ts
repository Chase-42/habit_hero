"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { container } from "~/di/container";
import { TYPES } from "~/di/tokens";
import { type IHabitUseCase } from "~/application/use-cases/habit/interface";
import { ValidationError } from "~/domain/errors/validation-error";
import { DatabaseError } from "~/domain/errors/database-error";
import { logger } from "~/infrastructure/logger";
import type { HabitCategory, HabitColor, FrequencyType } from "~/domain/enums";
import type { FrequencyValue } from "~/domain/utils/frequency";

export async function createHabit(params: {
  name: string;
  description?: string;
  category: HabitCategory;
  color: HabitColor;
  frequencyType: FrequencyType;
  frequencyValue: FrequencyValue;
  subCategory?: string;
  goal?: number;
  metricType?: string;
  units?: string;
  notes?: string;
  reminder?: Date;
  reminderEnabled?: boolean;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const habitUseCase = container.resolve<IHabitUseCase>(TYPES.HabitUseCase);
    const habit = await habitUseCase.createHabit({
      userId,
      ...params,
    });

    revalidatePath("/");
    return { success: true, habit };
  } catch (error) {
    logger.error("Error creating habit:", { error, params });
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new DatabaseError("Failed to create habit");
  }
}

export async function updateHabit(params: {
  id: string;
  name?: string;
  description?: string;
  category?: HabitCategory;
  color?: HabitColor;
  frequencyType?: FrequencyType;
  frequencyValue?: FrequencyValue;
  subCategory?: string;
  goal?: number;
  metricType?: string;
  units?: string;
  notes?: string;
  reminder?: Date;
  reminderEnabled?: boolean;
  isActive?: boolean;
  isArchived?: boolean;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const habitUseCase = container.resolve<IHabitUseCase>(TYPES.HabitUseCase);
    const habit = await habitUseCase.updateHabit({
      userId,
      ...params,
    });

    revalidatePath("/");
    return { success: true, habit };
  } catch (error) {
    logger.error("Error updating habit:", { error, params });
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new DatabaseError("Failed to update habit");
  }
}

export async function deleteHabit(habitId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const habitUseCase = container.resolve<IHabitUseCase>(TYPES.HabitUseCase);
    await habitUseCase.deleteHabit(habitId, userId);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    logger.error("Error deleting habit:", { error, habitId });
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new DatabaseError("Failed to delete habit");
  }
}

export async function getHabits() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const habitUseCase = container.resolve<IHabitUseCase>(TYPES.HabitUseCase);
    const habits = await habitUseCase.getHabits(userId);
    return { success: true, habits };
  } catch (error) {
    logger.error("Error getting habits:", { error, userId });
    throw new DatabaseError("Failed to get habits");
  }
}

export async function getHabitLogs(
  habitId: string,
  startDate?: Date,
  endDate?: Date
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const habitUseCase = container.resolve<IHabitUseCase>(TYPES.HabitUseCase);
    const logs = await habitUseCase.getHabitLogs({
      habitId,
      userId,
      startDate,
      endDate,
    });
    return { success: true, logs };
  } catch (error) {
    logger.error("Error getting habit logs:", {
      error,
      habitId,
      startDate,
      endDate,
    });
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new DatabaseError("Failed to get habit logs");
  }
}
