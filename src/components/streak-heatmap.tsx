"use client";

import {
  subDays,
  format,
  eachDayOfInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import { cn } from "~/lib/utils";
import type {
  DayCompletion,
  StreakHeatmapProps,
  HeatmapDayProps,
  HeatmapLegendProps,
} from "~/frameworks/next/types/chart";
import type { Habit, FrequencyType } from "~/entities/models/habit";

const getIntensityClass = (percentage: number): string => {
  if (percentage === 0) return "bg-muted";
  if (percentage < 0.25) return "bg-green-200 dark:bg-green-900";
  if (percentage < 0.5) return "bg-green-300 dark:bg-green-800";
  if (percentage < 0.75) return "bg-green-400 dark:bg-green-700";
  return "bg-green-500 dark:bg-green-600";
};

const HeatmapDay = ({ day }: HeatmapDayProps) => (
  <div
    className={cn(
      "group h-8 w-8 rounded-sm",
      getIntensityClass(day.percentage)
    )}
    title={`${format(day.date, "MMM d, yyyy")}: ${
      day.completed
    } of ${day.total} habits completed`}
  >
    <div className="invisible absolute z-50 rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 group-hover:visible group-hover:opacity-100">
      <div className="font-medium">{format(day.date, "MMM d, yyyy")}</div>
      <div className="text-muted-foreground">
        {day.completed} of {day.total} habits
      </div>
      <div className="text-muted-foreground">
        {Math.round(day.percentage)}% complete
      </div>
    </div>
  </div>
);

const HeatmapLegend = ({ weeks }: HeatmapLegendProps) => (
  <div className="flex items-center justify-between text-sm">
    <div className="font-medium">Last {weeks} Weeks</div>
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded-sm bg-muted" />
        <span className="text-xs text-muted-foreground">None</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded-sm bg-primary/20" />
        <span className="text-xs text-muted-foreground">Low</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded-sm bg-primary/70" />
        <span className="text-xs text-muted-foreground">High</span>
      </div>
    </div>
  </div>
);

const shouldTrackHabit = (habit: Habit, date: Date): boolean => {
  if (!habit.isActive || habit.isArchived) return false;

  if (habit.frequencyType === "daily") return true;

  if (habit.frequencyType === "weekly") {
    return habit.frequencyValue.days?.includes(date.getDay()) ?? false;
  }

  if (habit.frequencyType === "monthly") {
    return date.getDate() === 1;
  }

  return false;
};

export function StreakHeatmap({
  habits,
  habitLogs,
  days = 84, // 12 weeks
}: StreakHeatmapProps) {
  const today = new Date();
  const startDateRange = subDays(today, days - 1);
  const dateRange = eachDayOfInterval({ start: startDateRange, end: today });
  const weeks = Math.ceil(days / 7);

  // Calculate completion rate for each day
  const getDayCompletion = (date: Date): DayCompletion => {
    // Count active habits for this day
    const activeHabits = habits.filter((habit) =>
      shouldTrackHabit(habit, date)
    ).length;

    // Count completed habits for this day
    const completedHabits = habits.filter((habit) =>
      habitLogs.some((log) => {
        const completedAt = new Date(log.completedAt);
        return (
          log.habitId === habit.id &&
          completedAt >= startOfDay(date) &&
          completedAt <= endOfDay(date)
        );
      })
    ).length;

    return {
      date,
      percentage: activeHabits > 0 ? (completedHabits / activeHabits) * 100 : 0,
      completed: completedHabits,
      total: activeHabits,
    };
  };

  const data = dateRange.map(getDayCompletion);

  // Group data by weeks
  const weekData = Array.from({ length: weeks }, (_, i) => {
    const weekStart = i * 7;
    return data.slice(weekStart, weekStart + 7);
  });

  return (
    <div className="space-y-3">
      <HeatmapLegend weeks={weeks} />
      <div className="flex gap-1">
        <div className="grid grid-rows-7 gap-1 py-2 text-xs text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="h-8 px-2 text-right leading-8">
              {day}
            </div>
          ))}
        </div>
        <div className="grid auto-cols-fr grid-flow-col gap-1">
          {weekData.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-rows-7 gap-1">
              {Array.from({ length: 7 }, (_, i) => {
                const day = week[i];
                if (!day) return <div key={i} className="h-8 w-8" />;
                return <HeatmapDay key={i} day={day} />;
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
