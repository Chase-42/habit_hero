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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "~/types/api/validation";
import {
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  isSameDay,
} from "date-fns";
import { eq } from "drizzle-orm";
import { db } from "~/lib/db";

type NewHabit = Omit<
  Habit,
  "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
>;

interface UseHabitOperationsProps {
  userId: string;
  habits: Habit[];
  habitLogs: HabitLog[];
  onHabitsChange: (habits: Habit[]) => void;
  onLogsChange: (logs: HabitLog[]) => void;
}

export function useHabitOperations({
  userId,
  habits,
  habitLogs,
  onHabitsChange,
  onLogsChange,
}: UseHabitOperationsProps) {
  const [completingHabits, setCompletingHabits] = useState<Set<string>>(
    new Set()
  );

  const isHabitCompletedToday = (habitId: string) => {
    const today = startOfDay(new Date());
    return habitLogs.some(
      (log) =>
        log.habitId === habitId && isSameDay(log.completedAt as Date, today)
    );
  };

  const completeHabit = async (habit: Habit) => {
    const today = startOfDay(new Date());
    const isCompleted = isHabitCompletedToday(habit.id);

    // Add to completing set
    setCompletingHabits((prev) => new Set([...prev, habit.id]));

    try {
      // Update habits
      const updatedHabits = habits.map((h) =>
        h.id === habit.id
          ? {
              ...h,
              streak: isCompleted ? h.streak - 1 : h.streak + 1,
              lastCompleted: isCompleted ? null : today,
            }
          : h
      );
      onHabitsChange(updatedHabits);

      // Update logs
      if (isCompleted) {
        // Remove today's log
        const updatedLogs = habitLogs.filter(
          (log) =>
            log.habitId !== habit.id ||
            !isSameDay(log.completedAt as Date, today)
        );
        onLogsChange(updatedLogs);
      } else {
        // Add new log
        const newLog: HabitLog = {
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
        };
        onLogsChange([...habitLogs, newLog]);
      }

      // Call the API
      await toggleHabit(habit);
    } catch (error) {
      // Revert changes on error
      onHabitsChange(habits);
      onLogsChange(habitLogs);
      toast.error("Failed to update habit. Please try again.");
    } finally {
      // Remove from completing set
      setCompletingHabits((prev) => {
        const next = new Set(prev);
        next.delete(habit.id);
        return next;
      });
    }
  };

  const getTodayHabits = () => {
    const today = new Date().getDay();
    return habits.filter((habit) => {
      if (!habit.isActive || habit.isArchived) return false;

      if (habit.frequencyType === FrequencyType.DAILY) return true;

      if (habit.frequencyType === FrequencyType.WEEKLY) {
        const now = new Date();
        return isWithinInterval(now, {
          start: startOfWeek(now),
          end: endOfWeek(now),
        });
      }

      if (habit.frequencyType === FrequencyType.MONTHLY) {
        const now = new Date();
        return isWithinInterval(now, {
          start: startOfMonth(now),
          end: endOfMonth(now),
        });
      }

      return false;
    });
  };

  return {
    completingHabits,
    completeHabit,
    getTodayHabits,
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
    onSuccess: () => {
      // Invalidate and refetch habits query
      void queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitId: string): Promise<void> => {
      const response = await fetch(`/api/habits/${habitId}?id=${habitId}`, {
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
