import type { Habit } from "~/entities/models/habit";
import type { Goal } from "~/entities/models/goal";
import type { HabitLog } from "~/entities/models/habit-log";
import type { IHabitRepository } from "~/application/interfaces/repositories/habit-repository";
import type { IGoalRepository } from "~/application/interfaces/repositories/goal-repository";
import type { CreateHabitUseCase } from "~/application/use-cases/habits";
import type { CreateGoalUseCase } from "~/application/use-cases/goals/create-goal";
import type { Result } from "~/application/types";
import type { NotFoundError, ValidationError } from "~/entities/errors";
import {
  HabitCategory,
  HabitColor,
  HabitIcon,
  FrequencyType,
} from "~/entities/models/habit";

export const createMockHabit = (overrides: Partial<Habit> = {}): Habit => ({
  id: "mock-habit-id",
  userId: "mock-user-id",
  title: "Mock Habit",
  description: "Mock Description",
  category: HabitCategory.FITNESS,
  color: HabitColor.BLUE,
  icon: HabitIcon.DEFAULT,
  frequencyType: FrequencyType.DAILY,
  frequencyValue: { days: [1, 2, 3, 4, 5, 6, 7] },
  streak: 0,
  longestStreak: 0,
  isCompleted: false,
  isActive: true,
  isArchived: false,
  lastCompleted: null,
  notes: "",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockHabitLog = (
  overrides: Partial<HabitLog> = {}
): HabitLog => ({
  id: "mock-log-id",
  habitId: "mock-habit-id",
  userId: "mock-user-id",
  value: "1",
  notes: "Mock notes",
  details: "{}",
  difficulty: "normal",
  feeling: "good",
  hasPhoto: 0,
  completedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockGoal = (overrides: Partial<Goal> = {}): Goal => ({
  id: 1,
  userId: "mock-user-id",
  title: "Mock Goal",
  description: "Mock Description",
  notes: "",
  isCompleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockHabitRepository = (
  overrides: Partial<IHabitRepository> = {}
): IHabitRepository => ({
  findById: async () => ({ ok: true, value: createMockHabit() }),
  findByUserId: async () => ({ ok: true, value: [createMockHabit()] }),
  create: async () => ({ ok: true, value: createMockHabit() }),
  update: async () => ({ ok: true, value: createMockHabit() }),
  delete: async () => ({ ok: true, value: undefined }),
  exists: async () => ({ ok: true, value: true }),
  isOwnedBy: async () => ({ ok: true, value: true }),
  findByCategory: async () => ({ ok: true, value: [createMockHabit()] }),
  findByStatus: async () => ({ ok: true, value: [createMockHabit()] }),
  toggleStatus: async () => ({ ok: true, value: createMockHabit() }),
  updateStreak: async () => ({ ok: true, value: createMockHabit() }),
  resetStreak: async () => ({ ok: true, value: createMockHabit() }),
  archive: async () => ({ ok: true, value: createMockHabit() }),
  unarchive: async () => ({ ok: true, value: createMockHabit() }),
  markAsCompleted: async () => ({ ok: true, value: createMockHabit() }),
  markAsUncompleted: async () => ({ ok: true, value: createMockHabit() }),
  ...overrides,
});

export const createMockGoalRepository = (
  overrides: Partial<IGoalRepository> = {}
): IGoalRepository => ({
  create: async () => ({ ok: true, value: createMockGoal() }),
  findById: async () => ({ ok: true, value: createMockGoal() }),
  update: async () => ({ ok: true, value: createMockGoal() }),
  delete: async () => ({ ok: true, value: undefined }),
  findByUserId: async () => ({ ok: true, value: [createMockGoal()] }),
  validate: async () => ({ ok: true, value: true }),
  exists: async () => true,
  isOwnedBy: async () => true,
  findAll: async () => ({ ok: true, value: [createMockGoal()] }),
  ...overrides,
});

export const createMockHabitUseCases = (
  overrides: {
    createHabit?: Partial<CreateHabitUseCase>;
  } = {}
) => ({
  createHabit: {
    execute: async () => ({ ok: true, value: createMockHabit() }),
    ...overrides.createHabit,
  },
});

export const createMockGoalUseCases = (
  overrides: {
    createGoal?: Partial<CreateGoalUseCase>;
  } = {}
) => ({
  createGoal: {
    execute: async () => ({ ok: true, value: createMockGoal() }),
    ...overrides.createGoal,
  },
});
