import type {
  Habit,
  HabitLog,
  CreateHabitInput,
  UpdateHabitInput,
} from "../models/habit-types";

export interface IHabitRepository {
  create(input: CreateHabitInput): Promise<Habit>;
  update(input: UpdateHabitInput): Promise<Habit>;
  delete(habitId: string, userId: string): Promise<void>;
  findById(habitId: string, userId: string): Promise<Habit | null>;
  findAllByUserId(userId: string): Promise<Habit[]>;
  createLog(
    log: Omit<HabitLog, "id" | "createdAt" | "updatedAt">
  ): Promise<HabitLog>;
  findLogsByHabitId(habitId: string): Promise<HabitLog[]>;
  updateCompletion(habitId: string, userId: string): Promise<Habit>;
}
