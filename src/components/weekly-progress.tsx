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
import { subDays } from "date-fns";
import { Card } from "~/components/ui/card";
import { FrequencyType } from "~/types/common/enums";

interface HabitMomentumData {
  name: string;
  streak: number;
  completionRate: number;
  total: number;
  completed: number;
}

interface WeeklyProgressProps {
  habits: Habit[];
  habitLogs: HabitLog[];
}

export function WeeklyProgress({ habits, habitLogs }: WeeklyProgressProps) {
  // Get momentum data for each habit
  const data: HabitMomentumData[] = habits
    .filter((habit) => habit.isActive && !habit.isArchived)
    .map((habit) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get logs for the past week
      const weekAgo = subDays(today, 7);
      const habitLogsForWeek = habitLogs.filter(
        (log) =>
          log.habitId === habit.id &&
          log.completedAt >= weekAgo &&
          log.completedAt <= today
      );

      // Calculate expected completions based on frequency
      let expectedCompletions = 0;
      if (habit.frequencyType === FrequencyType.DAILY) {
        expectedCompletions = 7;
      } else if (habit.frequencyType === FrequencyType.WEEKLY) {
        expectedCompletions = habit.frequencyValue.days?.length ?? 0;
      }

      const completionRate =
        expectedCompletions > 0
          ? (habitLogsForWeek.length / expectedCompletions) * 100
          : 0;

      return {
        name: habit.name,
        streak: habit.streak || 0,
        completionRate,
        total: expectedCompletions,
        completed: habitLogsForWeek.length,
      };
    })
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, 5); // Show top 5 habits

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length > 0 && payload[0]?.payload) {
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
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          barSize={20}
          className="[&_.recharts-cartesian-axis-line]:stroke-border [&_.recharts-cartesian-axis-tick-line]:stroke-border [&_.recharts-cartesian-axis-tick-value]:fill-muted-foreground [&_.recharts-cartesian-grid-horizontal]:stroke-border [&_.recharts-cartesian-grid-vertical]:stroke-border"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            className="stroke-muted/30"
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            unit="%"
            axisLine={false}
            tickLine={false}
            className="text-xs font-medium"
            padding={{ left: 0, right: 0 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            className="text-xs font-medium"
            width={120}
            dx={-10}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "var(--muted)", opacity: 0.2 }}
          />
          <Bar
            dataKey="completionRate"
            className="fill-primary"
            radius={[0, 4, 4, 0]}
            animationDuration={1000}
            animationBegin={0}
            label={{
              position: "right",
              formatter: (value: number) => `${value.toFixed(0)}%`,
              className: "text-xs font-medium fill-muted-foreground",
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
