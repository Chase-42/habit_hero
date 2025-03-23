"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "~/components/ui/chart";
import type { Habit, HabitLog } from "~/types";
import { format } from "date-fns";

interface DailyData {
  date: string;
  total: number;
  completed: number;
}

export interface WeeklyProgressProps {
  habits: Habit[];
  habitLogs: HabitLog[];
}

export function WeeklyProgress({ habits, habitLogs }: WeeklyProgressProps) {
  // Get data for the past 7 days
  const getDailyData = (): DailyData[] => {
    const data: DailyData[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayOfWeek = date.getDay();

      // Count active habits for this day
      const activeHabits = habits.filter((habit) => {
        if (!habit.isActive || habit.isArchived) return false;

        if (habit.frequencyType === "daily") return true;

        if (habit.frequencyType === "weekly") {
          return habit.frequencyValue.days?.includes(dayOfWeek) ?? false;
        }

        if (habit.frequencyType === "monthly") {
          return date.getDate() === 1;
        }

        return false;
      }).length;

      // Count completed habits for this day
      const completedHabits = habits.filter((habit) =>
        habitLogs.some((log) => {
          // Parse completedAt string into a Date object
          const completedAt = new Date(log.completedAt);
          return (
            log.habitId === habit.id &&
            completedAt.toISOString().split("T")[0] === dateStr
          );
        })
      ).length;

      data.push({
        date: format(date, "EEE"),
        total: activeHabits,
        completed: completedHabits,
      });
    }

    return data;
  };

  const data = getDailyData();

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value: number) => `${value}%`} />
          <Bar dataKey="completed" fill="hsl(var(--chart-1))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
