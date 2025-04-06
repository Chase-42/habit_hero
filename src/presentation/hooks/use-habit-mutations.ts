import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Habit,
  HabitLog,
  CreateHabitInput,
} from "~/domain/models/habit-types";
import {
  type HabitCategory,
  type FrequencyType,
  type HabitColor,
} from "~/types/common/enums";
import { getHabitUseCase } from "~/di/container";

interface UseHabitMutationsOptions {
  userId: string;
}

export function useHabitMutations({ userId }: UseHabitMutationsOptions) {
  const queryClient = useQueryClient();
  const habitUseCase = getHabitUseCase();

  const completeHabit = useMutation({
    mutationFn: async (habitId: string) => {
      return habitUseCase.completeHabit(habitId, userId);
    },
    onMutate: async (habitId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["habits", userId] });
      await queryClient.cancelQueries({ queryKey: ["todayLogs", userId] });
      await queryClient.cancelQueries({ queryKey: ["recentLogs", userId] });

      // Snapshot the previous value
      const previousHabits = queryClient.getQueryData<Habit[]>([
        "habits",
        userId,
      ]);
      const previousTodayLogs = queryClient.getQueryData<HabitLog[]>([
        "todayLogs",
        userId,
      ]);
      const previousRecentLogs = queryClient.getQueryData<HabitLog[]>([
        "recentLogs",
        userId,
      ]);

      // Optimistically update the habits
      queryClient.setQueryData<Habit[]>(["habits", userId], (old = []) =>
        old.map((habit) =>
          habit.id === habitId
            ? {
                ...habit,
                lastCompleted: new Date(),
                streak: (habit.streak ?? 0) + 1,
              }
            : habit
        )
      );

      // Optimistically update today's logs
      const newLog: HabitLog = {
        id: crypto.randomUUID(),
        habitId,
        userId,
        completedAt: new Date(),
        value: null,
        notes: null,
        details: null,
        difficulty: null,
        feeling: null,
        hasPhoto: false,
        photoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      queryClient.setQueryData<HabitLog[]>(
        ["todayLogs", userId],
        (old = []) => [...old, newLog]
      );

      queryClient.setQueryData<HabitLog[]>(
        ["recentLogs", userId],
        (old = []) => [...old, newLog]
      );

      return { previousHabits, previousTodayLogs, previousRecentLogs };
    },
    onError: (error, habitId, context) => {
      // Rollback to the previous value on error
      if (context?.previousHabits) {
        queryClient.setQueryData(["habits", userId], context.previousHabits);
      }
      if (context?.previousTodayLogs) {
        queryClient.setQueryData(
          ["todayLogs", userId],
          context.previousTodayLogs
        );
      }
      if (context?.previousRecentLogs) {
        queryClient.setQueryData(
          ["recentLogs", userId],
          context.previousRecentLogs
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we're in sync
      void queryClient.invalidateQueries({ queryKey: ["habits", userId] });
      void queryClient.invalidateQueries({ queryKey: ["todayLogs", userId] });
      void queryClient.invalidateQueries({ queryKey: ["recentLogs", userId] });
    },
  });

  const deleteHabit = useMutation({
    mutationFn: async (habitId: string) => {
      return habitUseCase.deleteHabit(habitId, userId);
    },
    onMutate: async (habitId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["habits", userId] });
      await queryClient.cancelQueries({ queryKey: ["todayLogs", userId] });
      await queryClient.cancelQueries({ queryKey: ["recentLogs", userId] });

      // Snapshot the previous value
      const previousHabits = queryClient.getQueryData<Habit[]>([
        "habits",
        userId,
      ]);
      const previousTodayLogs = queryClient.getQueryData<HabitLog[]>([
        "todayLogs",
        userId,
      ]);
      const previousRecentLogs = queryClient.getQueryData<HabitLog[]>([
        "recentLogs",
        userId,
      ]);

      // Optimistically update the habits
      queryClient.setQueryData<Habit[]>(["habits", userId], (old = []) =>
        old.filter((habit) => habit.id !== habitId)
      );

      // Optimistically update logs
      queryClient.setQueryData<HabitLog[]>(["todayLogs", userId], (old = []) =>
        old.filter((log) => log.habitId !== habitId)
      );

      queryClient.setQueryData<HabitLog[]>(["recentLogs", userId], (old = []) =>
        old.filter((log) => log.habitId !== habitId)
      );

      return { previousHabits, previousTodayLogs, previousRecentLogs };
    },
    onError: (error, habitId, context) => {
      // Rollback to the previous value on error
      if (context?.previousHabits) {
        queryClient.setQueryData(["habits", userId], context.previousHabits);
      }
      if (context?.previousTodayLogs) {
        queryClient.setQueryData(
          ["todayLogs", userId],
          context.previousTodayLogs
        );
      }
      if (context?.previousRecentLogs) {
        queryClient.setQueryData(
          ["recentLogs", userId],
          context.previousRecentLogs
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we're in sync
      void queryClient.invalidateQueries({ queryKey: ["habits", userId] });
      void queryClient.invalidateQueries({ queryKey: ["todayLogs", userId] });
      void queryClient.invalidateQueries({ queryKey: ["recentLogs", userId] });
    },
  });

  const createHabit = useMutation({
    mutationFn: async (input: Omit<CreateHabitInput, "userId">) => {
      return habitUseCase.createHabit({ ...input, userId });
    },
    onMutate: async (newHabit) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["habits", userId] });

      // Snapshot the previous value
      const previousHabits = queryClient.getQueryData<Habit[]>([
        "habits",
        userId,
      ]);

      // Create a temporary ID for optimistic update
      const tempId = crypto.randomUUID();

      // Create the optimistic habit
      const optimisticHabit: Habit = {
        ...newHabit,
        id: tempId,
        userId,
        streak: 0,
        longestStreak: 0,
        lastCompleted: null,
        reminder: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      // Optimistically update the habits
      queryClient.setQueryData<Habit[]>(["habits", userId], (old = []) => [
        ...old,
        optimisticHabit,
      ]);

      return { previousHabits, tempId };
    },
    onError: (error, newHabit, context) => {
      // Rollback to the previous value on error
      if (context?.previousHabits) {
        queryClient.setQueryData(["habits", userId], context.previousHabits);
      }
    },
    onSuccess: (createdHabit, newHabit, context) => {
      // Update the habit with the real ID
      queryClient.setQueryData<Habit[]>(["habits", userId], (old = []) =>
        old.map((habit) =>
          habit.id === context?.tempId ? createdHabit : habit
        )
      );
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we're in sync
      void queryClient.invalidateQueries({ queryKey: ["habits", userId] });
    },
  });

  return {
    completeHabit: completeHabit.mutateAsync,
    deleteHabit: deleteHabit.mutateAsync,
    createHabit: createHabit.mutateAsync,
    isCompletingHabit: completeHabit.isPending,
    isDeletingHabit: deleteHabit.isPending,
    isCreatingHabit: createHabit.isPending,
  };
}
