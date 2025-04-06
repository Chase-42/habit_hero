import type { IHabitUseCase } from "~/application/use-cases/habit/interface";
import type { IHabitRepository } from "~/application/repositories/habit-repository";
import type {
  Habit,
  CreateHabitInput,
  UpdateHabitInput,
} from "~/domain/models/habit-types";

export class HabitUseCase implements IHabitUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async createHabit(input: CreateHabitInput): Promise<Habit> {
    return this.habitRepository.create(input);
  }

  async updateHabit(input: UpdateHabitInput): Promise<Habit> {
    return this.habitRepository.update(input);
  }

  async deleteHabit(habitId: string, userId: string): Promise<void> {
    return this.habitRepository.delete(habitId, userId);
  }

  async completeHabit(habitId: string, userId: string): Promise<Habit> {
    return this.habitRepository.updateCompletion(habitId, userId);
  }

  async getHabits(userId: string): Promise<Habit[]> {
    return this.habitRepository.findAllByUserId(userId);
  }

  async getHabit(habitId: string, userId: string): Promise<Habit> {
    const habit = await this.habitRepository.findById(habitId, userId);
    if (!habit) {
      throw new Error(`Habit with ID ${habitId} not found`);
    }
    return habit;
  }
}
