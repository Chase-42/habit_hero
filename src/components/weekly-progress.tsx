"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  type TooltipProps,
} from "recharts";
import type { Habit, HabitLog } from "~/types";
import { format } from "date-fns";
import { Card } from "~/components/ui/card";

interface DailyData {
  date: string;
  total: number;
  completed: number;
  percentage: number;
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
        percentage:
          activeHabits > 0 ? (completedHabits / activeHabits) * 100 : 0,
      });
    }

    return data;
  };

  const data = getDailyData();

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload as DailyData;
      return (
        <Card className="p-3">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            {data.percentage.toFixed(0)}% Completed
          </p>
          <p className="text-xs text-muted-foreground">
            {data.completed} of {data.total} habits
          </p>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            className="text-xs font-medium"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            className="text-xs font-medium"
            domain={[0, 100]}
            unit="%"
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "transparent" }}
          />
          <Bar
            dataKey="percentage"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
            className="fill-primary"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
