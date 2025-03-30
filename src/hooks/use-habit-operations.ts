import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Habit, HabitLog } from "~/types";
import {
  createHabit,
  fetchHabits,
  toggleHabit,
  fetchHabitLogs,
} from "~/lib/api-client";
import { FrequencyType } from "~/types/common/enums";

type NewHabit = Omit<
  Habit,
  "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
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
  deletingHabits: Set<string>;
}

export function useHabitOperations({ userId }: UseHabitOperationsProps) {
  const [state, setState] = useState<UseHabitOperationsState>({
    habits: [],
    habitLogs: [],
    isLoading: false,
    error: null,
    completingHabits: new Set(),
    deletingHabits: new Set(),
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
      const habits = await fetchHabits(userId);
      setPartialState({ habits });

      // Load recent logs (last 14 days) immediately
      const recentEndDate = new Date();
      const recentStartDate = new Date();
      recentStartDate.setDate(recentStartDate.getDate() - 14);

      const recentLogs = await Promise.all(
        habits.map(async (habit) => {
          const logs = await fetchHabitLogs(
            habit.id,
            recentStartDate,
            recentEndDate
          );
          return logs;
        })
      );
      setPartialState({ habitLogs: recentLogs.flat() });

      // Load older logs in the background
      void loadOlderLogs(habits, recentStartDate);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load habits";
      setPartialState({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      setPartialState({ isLoading: false });
    }
  };

  const loadOlderLogs = async (habits: Habit[], afterDate: Date) => {
    const olderEndDate = new Date(afterDate);
    const olderStartDate = new Date();
    olderStartDate.setDate(olderStartDate.getDate() - 84); // Load up to 84 days

    try {
      const olderLogs = await Promise.all(
        habits.map(async (habit) => {
          const logs = await fetchHabitLogs(
            habit.id,
            olderStartDate,
            olderEndDate
          );
          return logs;
        })
      );

      // Merge with existing logs
      setPartialState((prev: UseHabitOperationsState) => ({
        ...prev,
        habitLogs: [...prev.habitLogs, ...olderLogs.flat()],
      }));
    } catch (err) {
      console.error("Error loading older logs:", err);
      // Don't show error toast for background load
    }
  };

  const addHabit = async (newHabit: NewHabit) => {
    try {
      const habit = await createHabit(newHabit);
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
      await toggleHabit(habit, isCompleted);
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
    // Add to deleting set
    setPartialState({
      deletingHabits: new Set([...state.deletingHabits, habit.id]),
    });

    try {
      const response = await fetch(`/api/habits/${habit.id}?userId=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete habit");
      }

      // Update local state
      setPartialState({
        habits: state.habits.filter((h) => h.id !== habit.id),
        habitLogs: state.habitLogs.filter((log) => log.habitId !== habit.id),
      });

      toast.success(`${habit.name} deleted successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete habit";
      toast.error(errorMessage);
      throw error;
    } finally {
      // Remove from deleting set
      setPartialState({
        deletingHabits: new Set(
          [...state.deletingHabits].filter((id) => id !== habit.id)
        ),
      });
    }
  };

  const getTodayHabits = () => {
    const today = new Date().getDay();
    return state.habits.filter((habit) => {
      if (!habit.isActive || habit.isArchived) return false;

      if (habit.frequencyType === FrequencyType.Daily) return true;

      if (habit.frequencyType === FrequencyType.Weekly) {
        return habit.frequencyValue.days?.includes(today) ?? false;
      }

      // For monthly habits, show them on the 1st of each month
      if (habit.frequencyType === FrequencyType.Monthly) {
        return new Date().getDate() === 1;
      }

      return false;
    });
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
