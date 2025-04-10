import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Habit, HabitLog } from "~/types";
import {
  createHabit,
  fetchHabits,
  toggleHabit,
  fetchHabitLogs,
  completeHabit,
  deleteHabitLog,
} from "~/lib/api";
import { FrequencyType } from "~/types/common/enums";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "~/types/api/validation";
import {
  getTodayHabits as getTodayHabitsUtil,
  isHabitCompletedOnDate,
} from "~/lib/utils/habits";

type NewHabit = Omit<
  Habit,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "streak"
  | "longestStreak"
  | "lastCompleted"
>;

interface UseHabitOperationsProps {
  userId: string;
}

interface UseHabitOperationsState {
  habits: Habit[];
  habitLogs: HabitLog[];
  isLoading: boolean;
  error: string | null;
  completingHabits: Set<string>;
  isInitialLoad: boolean;
}

export function useHabitOperations({ userId }: UseHabitOperationsProps) {
  const [state, setState] = useState<UseHabitOperationsState>({
    habits: [],
    habitLogs: [],
    isLoading: false,
    error: null,
    completingHabits: new Set(),
    isInitialLoad: true,
  });

  const setPartialState = (
    partial:
      | Partial<UseHabitOperationsState>
      | ((prev: UseHabitOperationsState) => Partial<UseHabitOperationsState>)
  ) => {
    setState((prev) => ({
      ...prev,
      ...(typeof partial === "function" ? partial(prev) : partial),
    }));
  };

  useEffect(() => {
    if (!userId) return;
    void loadInitialData();
  }, [userId]);

  const loadInitialData = async () => {
    setPartialState({ isLoading: true, error: null });

    try {
      // Load habits first
      const habits = await fetchHabits();
      setPartialState({ habits });

      // Load only today's logs initially for faster first render
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayLogs = await Promise.all(
        habits.map(async (habit) => {
          const logs = await fetchHabitLogs(habit.id, today, tomorrow, userId);
          return logs;
        })
      );
      setPartialState({
        habitLogs: todayLogs.flat(),
        isInitialLoad: false,
      });

      // Load recent logs in the background
      void loadRecentLogs(habits);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load habits";
      setPartialState({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      setPartialState({ isLoading: false });
    }
  };

  const loadRecentLogs = async (habits: Habit[]) => {
    const recentEndDate = new Date();
    const recentStartDate = new Date();
    recentStartDate.setDate(recentStartDate.getDate() - 14);

    try {
      const recentLogs = await Promise.all(
        habits.map(async (habit) => {
          const logs = await fetchHabitLogs(
            habit.id,
            recentStartDate,
            recentEndDate,
            userId
          );
          return logs;
        })
      );

      // Merge with existing logs, avoiding duplicates
      setPartialState((prev) => {
        const existingLogIds = new Set(prev.habitLogs.map((log) => log.id));
        const newLogs = recentLogs
          .flat()
          .filter((log) => !existingLogIds.has(log.id));
        return {
          habitLogs: [...prev.habitLogs, ...newLogs],
        };
      });
    } catch (err) {
      console.error("Error loading recent logs:", err);
    }
  };

  const addHabit = async (newHabit: NewHabit) => {
    try {
      const habit = await createHabit({
        ...newHabit,
        streak: 0,
        longestStreak: 0,
        lastCompleted: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setPartialState({
        habits: [...state.habits, habit],
      });
      toast.success("Habit created successfully!");
      return habit;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create habit";
      toast.error(errorMessage);
      throw err;
    }
  };

  const completeHabit = async (habit: Habit) => {
    const isCompleted = habit.lastCompleted !== null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add to completing set
    setPartialState({
      completingHabits: new Set([...state.completingHabits, habit.id]),
    });

    // Optimistically update UI
    setPartialState({
      habits: state.habits.map((h) =>
        h.id === habit.id
          ? {
              ...h,
              streak: isCompleted ? h.streak - 1 : h.streak + 1,
              lastCompleted: isCompleted ? null : today,
            }
          : h
      ),
    });

    // Update logs state
    setPartialState({
      habitLogs: isCompleted
        ? state.habitLogs.filter(
            (log) =>
              log.habitId !== habit.id ||
              new Date(log.completedAt).setHours(0, 0, 0, 0) !== today.getTime()
          )
        : [
            ...state.habitLogs,
            {
              id: crypto.randomUUID(),
              habitId: habit.id,
              userId: habit.userId,
              completedAt: today,
              value: null,
              notes: null,
              details: null,
              difficulty: null,
              feeling: null,
              hasPhoto: false,
              photoUrl: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
    });

    try {
      await toggleHabit(habit, !isCompleted);
    } catch (error) {
      // Revert optimistic updates on error
      setPartialState({
        habits: state.habits.map((h) =>
          h.id === habit.id
            ? {
                ...h,
                streak: isCompleted ? h.streak + 1 : h.streak - 1,
                lastCompleted: isCompleted ? today : null,
              }
            : h
        ),
        habitLogs: isCompleted
          ? [
              ...state.habitLogs,
              {
                id: crypto.randomUUID(),
                habitId: habit.id,
                userId: habit.userId,
                completedAt: today,
                value: null,
                notes: null,
                details: null,
                difficulty: null,
                feeling: null,
                hasPhoto: false,
                photoUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ]
          : state.habitLogs.filter(
              (log) =>
                log.habitId !== habit.id ||
                new Date(log.completedAt).setHours(0, 0, 0, 0) !==
                  today.getTime()
            ),
      });

      toast.error("Failed to update habit. Please try again.");
    } finally {
      // Remove from completing set
      setPartialState({
        completingHabits: new Set(
          [...state.completingHabits].filter((id) => id !== habit.id)
        ),
      });
    }
  };

  const deleteHabit = async (habit: Habit) => {
    try {
      // Optimistically update UI
      setPartialState({
        habits: state.habits.filter((h) => h.id !== habit.id),
        habitLogs: state.habitLogs.filter((log) => log.habitId !== habit.id),
      });

      await fetch(`/api/habits/${habit.id}`, {
        method: "DELETE",
      });

      toast.success(`${habit.name} deleted successfully`);
    } catch (err) {
      // Revert optimistic update on error
      setPartialState({
        habits: [...state.habits],
        habitLogs: [...state.habitLogs],
      });

      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete habit";
      toast.error(errorMessage);
      throw err;
    }
  };

  const getTodayHabits = () => {
    return getTodayHabitsUtil(state.habits);
  };

  return {
    ...state,
    addHabit,
    completeHabit,
    deleteHabit,
    getTodayHabits,
    refresh: loadInitialData,
  };
}

export function useAddHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habit: NewHabit): Promise<Habit> => {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(habit),
      });

      if (!response.ok) {
        throw new Error("Failed to create habit");
      }

      const result = (await response.json()) as ApiResponse<Habit>;
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onMutate: async (newHabit) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["habits"] });

      // Snapshot the previous value
      const previousHabits = queryClient.getQueryData<Habit[]>(["habits"]);

      // Optimistically update to the new value
      queryClient.setQueryData<Habit[]>(["habits"], (old) => {
        if (!old) return [];
        const optimisticHabit: Habit = {
          ...newHabit,
          id: "temp-id",
          streak: 0,
          longestStreak: 0,
          lastCompleted: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return [...old, optimisticHabit];
      });

      return { previousHabits };
    },
    onError: (err, newHabit, context) => {
      // Revert to the previous value on error
      if (context?.previousHabits) {
        queryClient.setQueryData<Habit[]>(["habits"], context.previousHabits);
      }
    },
    onSuccess: (newHabit) => {
      // Update the cache with the real data
      queryClient.setQueryData<Habit[]>(["habits"], (old) => {
        if (!old) return [newHabit];
        return old.map((h) => (h.id === "temp-id" ? newHabit : h));
      });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitId: string): Promise<void> => {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = (await response.json()) as ApiResponse<null>;
        if (result.error) {
          throw new Error(result.error.message);
        }
        throw new Error("Failed to delete habit");
      }
    },
    onSuccess: () => {
      // Invalidate both habits and habitLogs queries to refresh the UI
      void queryClient.invalidateQueries({ queryKey: ["habits"] });
      void queryClient.invalidateQueries({ queryKey: ["habitLogs"] });
    },
  });
}
