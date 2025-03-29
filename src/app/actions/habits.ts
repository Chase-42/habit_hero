"use server";

import { container } from "tsyringe";
import { type HabitController } from "../../interface-adapters/controllers/habit.controller";
import { z } from "zod";
import { HabitSchema } from "../../entities/models/habit";
import type { Result } from "../../application/types";

const createHabitSchema = HabitSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export async function createHabit(data: unknown) {
  try {
    const validatedData = createHabitSchema.parse(data);

    const habitController =
      container.resolve<HabitController>("HabitController");
    const habit = await habitController.createHabit(validatedData);

    return { data: habit };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid request data", details: error.errors };
    }

    return { error: "Internal server error" };
  }
}

export async function getUserHabits(userId: string) {
  try {
    const habitController =
      container.resolve<HabitController>("HabitController");
    const habits = await habitController.getHabits(userId);

    return { data: habits };
  } catch (error) {
    return { error: "Internal server error" };
  }
}
