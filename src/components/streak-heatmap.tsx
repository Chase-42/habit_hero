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
} from "~/types/chart";
import { FrequencyType } from "~/types/common/enums";

const getIntensityClass = (percentage: number): string => {
  if (percentage === 0) return "bg-muted";
  if (percentage <= 25) return "bg-primary/20";
  if (percentage <= 50) return "bg-primary/40";
  if (percentage <= 75) return "bg-primary/70";
  return "bg-primary";
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
    // Create date range for the day
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    // Count active habits for this day
    const activeHabits = habits.filter((habit) => {
      if (!habit.isActive || habit.isArchived) return false;

      if (habit.frequencyType === FrequencyType.Daily) return true;

      if (habit.frequencyType === FrequencyType.Weekly) {
        return habit.frequencyValue.days?.includes(date.getDay()) ?? false;
      }

      if (habit.frequencyType === FrequencyType.Monthly) {
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
          completedAt >= dayStart &&
          completedAt <= dayEnd
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
