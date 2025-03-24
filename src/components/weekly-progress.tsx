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
import { format, subDays } from "date-fns";
import { Card } from "~/components/ui/card";

interface HabitMomentumData {
  name: string;
  streak: number;
  completionRate: number;
  total: number;
  completed: number;
}

export interface WeeklyProgressProps {
  habits: Habit[];
  habitLogs: HabitLog[];
}

export function WeeklyProgress({ habits, habitLogs }: WeeklyProgressProps) {
  // Get momentum data for each habit
  const getMomentumData = (): HabitMomentumData[] => {
    const today = new Date();
    const weekAgo = subDays(today, 7);

    return habits
      .filter((habit) => habit.isActive && !habit.isArchived)
      .map((habit) => {
        // Calculate total possible completions in the past week
        let totalPossible = 0;
        if (habit.frequencyType === "daily") {
          totalPossible = 7;
        } else if (habit.frequencyType === "weekly") {
          totalPossible = 1;
        } else if (habit.frequencyType === "monthly") {
          // Check if the 1st of the month was in the past week
          const firstOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          );
          if (firstOfMonth >= weekAgo && firstOfMonth <= today) {
            totalPossible = 1;
          }
        }

        // Count actual completions in the past week
        const completions = habitLogs.filter((log) => {
          const completedAt = new Date(log.completedAt);
          return (
            log.habitId === habit.id &&
            completedAt >= weekAgo &&
            completedAt <= today
          );
        }).length;

        return {
          name: habit.name,
          streak: habit.streak,
          completionRate:
            totalPossible > 0 ? (completions / totalPossible) * 100 : 0,
          total: totalPossible,
          completed: completions,
        };
      })
      .sort(
        (a, b) => b.streak - a.streak || b.completionRate - a.completionRate
      );
  };

  const data = getMomentumData();

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload as HabitMomentumData;
      return (
        <Card className="p-3">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.streak} day streak
          </p>
          <p className="text-sm text-muted-foreground">
            {data.completionRate.toFixed(0)}% this week
          </p>
          <p className="text-xs text-muted-foreground">
            {data.completed} of {data.total} completions
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
          layout="vertical"
          margin={{ top: 10, right: 10, left: 120, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-muted"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            unit="%"
            axisLine={false}
            tickLine={false}
            className="text-xs font-medium"
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            className="text-xs font-medium"
            width={110}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "transparent" }}
          />
          <Bar
            dataKey="completionRate"
            fill="hsl(var(--primary))"
            radius={[0, 4, 4, 0]}
            className="fill-primary"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
