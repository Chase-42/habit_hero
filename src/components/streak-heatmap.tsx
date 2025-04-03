"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import type { StreakHeatmapProps } from "~/types/chart";
import { FrequencyType } from "~/types/common/enums";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

const DAYS_TO_SHOW = 30; // Show last 30 days

const chartConfig = {
  completion: {
    label: "Completion Rate",
    color: "rgb(16, 185, 129)", // emerald-500
  },
  total: {
    label: "Total Habits",
    color: "rgb(16, 185, 129)", // emerald-500
  },
};

export function StreakHeatmap({ habits, habitLogs }: StreakHeatmapProps) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("completion");

  // Generate chart data
  const chartData = React.useMemo(() => {
    console.log(
      "[STREAK_HEATMAP] Input data:",
      JSON.stringify(
        {
          habitsCount: habits.length,
          logsCount: habitLogs.length,
          habits: habits.map((h) => ({
            id: h.id,
            name: h.name,
            isActive: h.isActive,
            isArchived: h.isArchived,
          })),
        },
        null,
        2
      )
    );

    const today = new Date();
    const startDate = subDays(today, DAYS_TO_SHOW - 1);
    const dates = Array.from({ length: DAYS_TO_SHOW }, (_, i) => {
      const date = subDays(today, DAYS_TO_SHOW - 1 - i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      // Count active habits and completed habits for the day
      const activeHabits = habits.filter(
        (habit) =>
          !habit.isArchived &&
          habit.isActive &&
          isHabitActiveForDate(habit, date)
      );

      const completedHabits = activeHabits.filter((habit) =>
        habitLogs.some((log) => {
          const completedAt = new Date(log.completedAt);
          const logDate = new Date(
            completedAt.getFullYear(),
            completedAt.getMonth(),
            completedAt.getDate()
          );
          const compareDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          );
          return (
            log.habitId === habit.id &&
            logDate.getTime() === compareDate.getTime()
          );
        })
      );

      const dayData = {
        date: format(date, "yyyy-MM-dd"),
        completion:
          activeHabits.length > 0
            ? Math.round((completedHabits.length / activeHabits.length) * 100)
            : 0,
        total: activeHabits.length,
        completed: completedHabits.length,
      };

      // Log data for today
      if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
        console.log(
          "[STREAK_HEATMAP] Today's data:",
          JSON.stringify(
            {
              date: dayData.date,
              activeHabits: activeHabits.map((h) => ({
                id: h.id,
                name: h.name,
              })),
              completedHabits: completedHabits.map((h) => ({
                id: h.id,
                name: h.name,
              })),
              completion: dayData.completion,
              total: dayData.total,
              completed: dayData.completed,
            },
            null,
            2
          )
        );
      }

      return dayData;
    });

    console.log(
      "[STREAK_HEATMAP] Chart data:",
      JSON.stringify(
        {
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(today, "yyyy-MM-dd"),
          daysWithData: dates.filter((d) => d.total > 0).length,
          totalDays: dates.length,
          data: dates,
        },
        null,
        2
      )
    );

    return dates;
  }, [habits, habitLogs]);

  // Calculate totals for the header
  const totals = React.useMemo(() => {
    // Only include days with completions in the completion rate average
    const daysWithCompletions = chartData.filter((day) => day.completed > 0);
    const totalCompletion = daysWithCompletions.reduce(
      (acc, curr) => acc + curr.completion,
      0
    );

    const result = {
      completion:
        daysWithCompletions.length > 0
          ? Math.round(totalCompletion / daysWithCompletions.length)
          : 0,
      total: Math.round(
        chartData.reduce((acc, curr) => acc + curr.total, 0) / chartData.length
      ),
    };

    console.log(
      "[STREAK_HEATMAP] Totals calculation:",
      JSON.stringify(
        {
          daysWithCompletions: daysWithCompletions.length,
          totalDays: chartData.length,
          totalCompletion,
          daysWithCompletionsData: daysWithCompletions,
          result,
        },
        null,
        2
      )
    );

    return result;
  }, [chartData]);

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Habit Completion</CardTitle>
          <CardDescription>
            Your habit completion trends over the last {DAYS_TO_SHOW} days
          </CardDescription>
        </div>
        <div className="flex">
          {(["completion", "total"] as const).map((key) => (
            <button
              key={key}
              data-active={activeChart === key}
              className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
              onClick={() => setActiveChart(key)}
            >
              <span className="text-xs text-muted-foreground">
                {chartConfig[key].label}
              </span>
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {key === "completion" ? `${totals[key]}%` : totals[key]}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="h-[300px] px-2 pt-6 sm:px-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) => {
                const date = new Date(value);
                return format(date, "MMM d");
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const data = payload[0] as {
                  value: number;
                  payload: {
                    date: string;
                    completion: number;
                    total: number;
                  };
                };
                const value = data.value;
                const date = data.payload.date;

                if (!date || typeof value !== "number") return null;

                return (
                  <div className="rounded-lg border bg-background p-2 shadow-md">
                    <div className="font-medium">
                      {format(new Date(date), "MMM d, yyyy")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {activeChart === "completion"
                        ? `${value}% completed`
                        : `${value} habits`}
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey={activeChart}
              fill={chartConfig[activeChart].color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Helper function to check if a habit is active for a given date
function isHabitActiveForDate(
  habit: {
    frequencyType: FrequencyType;
    frequencyValue: { days?: number[] };
  },
  date: Date
): boolean {
  switch (habit.frequencyType) {
    case FrequencyType.Daily:
      return true;
    case FrequencyType.Weekly:
      return habit.frequencyValue.days?.includes(date.getDay()) ?? false;
    case FrequencyType.Monthly:
      return date.getDate() === 1;
    default:
      return false;
  }
}
