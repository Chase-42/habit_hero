import { resolve } from "~/di/container";
import { HabitUseCaseSymbol } from "~/di/container";
import { type IHabitUseCase } from "~/application/use-cases/habit/interface";
import { type Habit } from "~/domain/entities/habit";
import { HabitLog } from "~/domain/entities/habit-log";

export async function createHabit(
  data: Omit<Habit, "id" | "createdAt" | "updatedAt">
) {
  "use server";
  const habitUseCase = resolve<IHabitUseCase>(HabitUseCaseSymbol);
  return habitUseCase.createHabit(data);
}

export async function updateHabit(id: string, data: Partial<Habit>) {
  "use server";
  const habitUseCase = resolve<IHabitUseCase>(HabitUseCaseSymbol);
  return habitUseCase.updateHabit(id, data);
}

export async function deleteHabit(id: string) {
  "use server";
  const habitUseCase = resolve<IHabitUseCase>(HabitUseCaseSymbol);
  return habitUseCase.deleteHabit(id);
}

export async function getHabit(id: string) {
  "use server";
  const habitUseCase = resolve<IHabitUseCase>(HabitUseCaseSymbol);
  return habitUseCase.getHabit(id);
}

export async function listHabits() {
  "use server";
  const habitUseCase = resolve<IHabitUseCase>(HabitUseCaseSymbol);
  return habitUseCase.listHabits();
}

export async function completeHabit(id: string, notes?: string) {
  "use server";
  const habitUseCase = resolve<IHabitUseCase>(HabitUseCaseSymbol);
  return habitUseCase.completeHabit(id, notes);
}

export async function getHabitLogs(habitId: string) {
  "use server";
  const habitUseCase = resolve<IHabitUseCase>(HabitUseCaseSymbol);
  return habitUseCase.getHabitLogs(habitId);
}
