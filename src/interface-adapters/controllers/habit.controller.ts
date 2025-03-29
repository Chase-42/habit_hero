import { injectable, inject } from "tsyringe";
import type {
  GetHabitsUseCase,
  GetHabitUseCase,
  CreateHabitUseCase,
  UpdateHabitUseCase,
  DeleteHabitUseCase,
} from "~/application/use-cases/habits";
import type { Habit, CreateHabit, UpdateHabit } from "~/entities/models/habit";
import type { LogHabitUseCase } from "../../application/use-cases/log-habit";
import type { ToggleHabitUseCase } from "../../application/use-cases/habits/toggle-habit";
import type { Result } from "../../application/types";
import {
  ValidationError,
  NotFoundError,
  RepositoryError,
} from "../../entities/errors";
import type { IHabitRepository } from "~/application/interfaces/repositories/habit-repository";
import {
  HabitPresenter,
  type HabitResponse,
} from "../presenters/habit.presenter";
import { ValidationService } from "../../infrastructure/services/validation.service";
import type {
  HabitLog,
  CreateHabitLog,
  UpdateHabitLog,
} from "~/entities/models/habit-log";
import type { Goal, CreateGoal, UpdateGoal } from "~/entities/models/goal";
import {
  createMockHabitRepository,
  createMockHabit,
} from "~/test/factories/mock-factory";

export interface HabitController {
  getHabits(userId: string): Promise<Result<Habit[], NotFoundError>>;
  getHabit(id: string): Promise<Result<Habit, NotFoundError>>;
  createHabit(data: CreateHabit): Promise<Result<Habit, ValidationError>>;
  updateHabit(
    id: string,
    data: UpdateHabit
  ): Promise<Result<Habit, ValidationError | NotFoundError>>;
  deleteHabit(id: string): Promise<Result<void, NotFoundError>>;
  toggleHabit(
    id: string,
    userId: string,
    completed: boolean
  ): Promise<Result<Habit, ValidationError | NotFoundError>>;
  findByUserId(userId: string): Promise<Result<Habit[], NotFoundError>>;
}

@injectable()
export class HabitControllerImpl implements HabitController {
  constructor(
    @inject("IHabitRepository")
    private readonly habitRepository: IHabitRepository,
    @inject("ToggleHabitUseCase")
    private readonly toggleHabitUseCase: ToggleHabitUseCase,
    @inject("ValidationService")
    private readonly validationService: ValidationService
  ) {}

  async getHabits(userId: string): Promise<Result<Habit[], NotFoundError>> {
    const result = await this.habitRepository.findByUserId(userId);
    if (!result.ok) {
      return result;
    }
    return { ok: true, value: result.value };
  }

  async getHabit(id: string): Promise<Result<Habit, NotFoundError>> {
    const result = await this.habitRepository.findById(id);
    if (!result.ok) {
      return result;
    }
    return { ok: true, value: result.value };
  }

  async createHabit(
    data: CreateHabit
  ): Promise<Result<Habit, ValidationError>> {
    const validationResult = this.validationService.validateCreateHabit(data);
    if (!validationResult.ok) {
      return validationResult;
    }

    const result = await this.habitRepository.create(validationResult.value);
    if (!result.ok) {
      return result;
    }
    return { ok: true, value: result.value };
  }

  async updateHabit(
    id: string,
    data: UpdateHabit
  ): Promise<Result<Habit, ValidationError | NotFoundError>> {
    const validationResult = this.validationService.validateUpdateHabit(data);
    if (!validationResult.ok) {
      return validationResult;
    }

    const result = await this.habitRepository.update(
      id,
      validationResult.value
    );
    if (!result.ok) {
      return result;
    }
    return { ok: true, value: result.value };
  }

  async deleteHabit(id: string): Promise<Result<void, NotFoundError>> {
    const result = await this.habitRepository.delete(id);
    if (!result.ok) {
      return result;
    }
    return { ok: true, value: undefined };
  }

  async toggleHabit(
    id: string,
    userId: string,
    completed: boolean
  ): Promise<Result<Habit, ValidationError | NotFoundError>> {
    const result = await this.toggleHabitUseCase.execute(id, userId, completed);
    if (!result.ok) {
      return result;
    }
    return { ok: true, value: result.value };
  }

  async findByUserId(userId: string): Promise<Result<Habit[], NotFoundError>> {
    const result = await this.habitRepository.findByUserId(userId);
    if (!result.ok) {
      return result;
    }
    return { ok: true, value: result.value };
  }
}

// Factory functions for the controller
export const getHabitsController = async (
  userId: string
): Promise<Result<Habit[], NotFoundError>> => {
  const controller = new HabitControllerImpl(
    createMockHabitRepository(),
    {
      execute: async () => ({ ok: true, value: createMockHabit() }),
    },
    {
      validateCreateHabit: () => ({ ok: true, value: {} as CreateHabit }),
      validateUpdateHabit: () => ({ ok: true, value: {} as UpdateHabit }),
      validateHabit: () => ({ ok: true, value: createMockHabit() }),
      validateHabitLog: () => ({ ok: true, value: {} as HabitLog }),
      validateCreateHabitLog: () => ({ ok: true, value: {} as CreateHabitLog }),
      validateUpdateHabitLog: () => ({ ok: true, value: {} as UpdateHabitLog }),
      validateGoal: () => ({ ok: true, value: {} as Goal }),
      validateCreateGoal: () => ({ ok: true, value: {} as CreateGoal }),
      validateUpdateGoal: () => ({ ok: true, value: {} as UpdateGoal }),
    }
  );
  return controller.getHabits(userId);
};

export const getHabitController = async (
  id: string
): Promise<Result<Habit, NotFoundError>> => {
  const controller = new HabitControllerImpl(
    createMockHabitRepository(),
    {
      execute: async () => ({ ok: true, value: createMockHabit() }),
    },
    {
      validateCreateHabit: () => ({ ok: true, value: {} as CreateHabit }),
      validateUpdateHabit: () => ({ ok: true, value: {} as UpdateHabit }),
      validateHabit: () => ({ ok: true, value: createMockHabit() }),
      validateHabitLog: () => ({ ok: true, value: {} as HabitLog }),
      validateCreateHabitLog: () => ({ ok: true, value: {} as CreateHabitLog }),
      validateUpdateHabitLog: () => ({ ok: true, value: {} as UpdateHabitLog }),
      validateGoal: () => ({ ok: true, value: {} as Goal }),
      validateCreateGoal: () => ({ ok: true, value: {} as CreateGoal }),
      validateUpdateGoal: () => ({ ok: true, value: {} as UpdateGoal }),
    }
  );
  return controller.getHabit(id);
};

export const createHabitController = async (
  data: CreateHabit
): Promise<Result<Habit, ValidationError>> => {
  const controller = new HabitControllerImpl(
    createMockHabitRepository(),
    {
      execute: async () => ({ ok: true, value: createMockHabit() }),
    },
    {
      validateCreateHabit: () => ({ ok: true, value: {} as CreateHabit }),
      validateUpdateHabit: () => ({ ok: true, value: {} as UpdateHabit }),
      validateHabit: () => ({ ok: true, value: createMockHabit() }),
      validateHabitLog: () => ({ ok: true, value: {} as HabitLog }),
      validateCreateHabitLog: () => ({ ok: true, value: {} as CreateHabitLog }),
      validateUpdateHabitLog: () => ({ ok: true, value: {} as UpdateHabitLog }),
      validateGoal: () => ({ ok: true, value: {} as Goal }),
      validateCreateGoal: () => ({ ok: true, value: {} as CreateGoal }),
      validateUpdateGoal: () => ({ ok: true, value: {} as UpdateGoal }),
    }
  );
  return controller.createHabit(data);
};

export const updateHabitController = async (
  id: string,
  data: UpdateHabit
): Promise<Result<Habit, ValidationError | NotFoundError>> => {
  const controller = new HabitControllerImpl(
    createMockHabitRepository(),
    {
      execute: async () => ({ ok: true, value: createMockHabit() }),
    },
    {
      validateCreateHabit: () => ({ ok: true, value: {} as CreateHabit }),
      validateUpdateHabit: () => ({ ok: true, value: {} as UpdateHabit }),
      validateHabit: () => ({ ok: true, value: createMockHabit() }),
      validateHabitLog: () => ({ ok: true, value: {} as HabitLog }),
      validateCreateHabitLog: () => ({ ok: true, value: {} as CreateHabitLog }),
      validateUpdateHabitLog: () => ({ ok: true, value: {} as UpdateHabitLog }),
      validateGoal: () => ({ ok: true, value: {} as Goal }),
      validateCreateGoal: () => ({ ok: true, value: {} as CreateGoal }),
      validateUpdateGoal: () => ({ ok: true, value: {} as UpdateGoal }),
    }
  );
  return controller.updateHabit(id, data);
};

export const deleteHabitController = async (
  id: string
): Promise<Result<void, NotFoundError>> => {
  const controller = new HabitControllerImpl(
    createMockHabitRepository(),
    {
      execute: async () => ({ ok: true, value: createMockHabit() }),
    },
    {
      validateCreateHabit: () => ({ ok: true, value: {} as CreateHabit }),
      validateUpdateHabit: () => ({ ok: true, value: {} as UpdateHabit }),
      validateHabit: () => ({ ok: true, value: createMockHabit() }),
      validateHabitLog: () => ({ ok: true, value: {} as HabitLog }),
      validateCreateHabitLog: () => ({ ok: true, value: {} as CreateHabitLog }),
      validateUpdateHabitLog: () => ({ ok: true, value: {} as UpdateHabitLog }),
      validateGoal: () => ({ ok: true, value: {} as Goal }),
      validateCreateGoal: () => ({ ok: true, value: {} as CreateGoal }),
      validateUpdateGoal: () => ({ ok: true, value: {} as UpdateGoal }),
    }
  );
  return controller.deleteHabit(id);
};
