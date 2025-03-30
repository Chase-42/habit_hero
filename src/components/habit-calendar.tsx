"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { Habit, HabitLog } from "~/types";
import {
  format,
  startOfMonth,
  getDaysInMonth,
  isSameDay,
  parseISO,
  isWithinInterval,
  subDays,
  differenceInDays,
} from "date-fns";

export interface HabitCalendarProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  isLoading?: boolean;
}

export function HabitCalendar({
  habits,
  habitLogs,
  isLoading,
}: HabitCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  // Memoize date-related values
  const { firstDayOfMonth, daysInMonth, today } = useMemo(
    () => ({
      firstDayOfMonth: startOfMonth(currentMonth).getDay(),
      daysInMonth: getDaysInMonth(currentMonth),
      today: new Date(),
    }),
    [currentMonth]
  );

  // Create an efficient lookup map for habit logs
  const habitLogsMap = useMemo(() => {
    const map = new Map<string, Set<string>>();

    habitLogs.forEach((log) => {
      if (!log?.habitId || !log?.completedAt) return;

      try {
        const date = new Date(log.completedAt);
        const dateKey = format(date, "yyyy-MM-dd");

        const existingSet = map.get(dateKey) ?? new Set<string>();
        existingSet.add(log.habitId);
        map.set(dateKey, existingSet);
      } catch {
        console.warn("Invalid date in habit log:", log);
      }
    });

    return map;
  }, [habitLogs]);

  // Calculate streaks and completion stats
  const { streaks, monthStats } = useMemo(() => {
    const streakMap = new Map<string, number>();
    const completionCounts = new Map<string, number>();

    habits.forEach((habit) => {
      let currentStreak = 0;
      let maxStreak = 0;
      let lastCompletedDate: Date | null = null;
      let monthlyCompletions = 0;

      // Go through last 30 days to calculate streaks
      for (let i = 0; i < 30; i++) {
        const date = subDays(today, i);
        const dateKey = format(date, "yyyy-MM-dd");
        const completedHabits = habitLogsMap.get(dateKey);

        if (completedHabits?.has(habit.id)) {
          currentStreak++;
          if (currentStreak > maxStreak) maxStreak = currentStreak;

          lastCompletedDate ??= date;

          // Count completions for current month
          if (date.getMonth() === currentMonth.getMonth()) {
            monthlyCompletions++;
          }
        } else {
          currentStreak = 0;
        }
      }

      streakMap.set(habit.id, maxStreak);
      completionCounts.set(habit.id, monthlyCompletions);
    });

    return {
      streaks: streakMap,
      monthStats: completionCounts,
    };
  }, [habits, habitLogsMap, currentMonth, today]);

  const getHabitsForDate = useCallback(
    (date: Date) => {
      try {
        const dateKey = format(date, "yyyy-MM-dd");
        const completedHabitIds = habitLogsMap.get(dateKey);
        if (!completedHabitIds) return [];
        return habits.filter(
          (habit) => habit.id && completedHabitIds.has(habit.id)
        );
      } catch (e) {
        console.error("Error getting habits for date:", e);
        return [];
      }
    },
    [habits, habitLogsMap]
  );

  const getCompletionLevel = (completedHabits: Habit[]) => {
    if (completedHabits.length === 0) return "none";
    const percentage = (completedHabits.length / habits.length) * 100;
    if (percentage === 100) return "full";
    if (percentage >= 75) return "high";
    if (percentage >= 50) return "medium";
    return "low";
  };

  const handleKeyPress = useCallback((e: React.KeyboardEvent, date: Date) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      // Handle day selection if needed
    }
  }, []);

  const renderDay = useCallback(
    (day: number) => {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const completedHabits = getHabitsForDate(date);
      const isCurrentDay = isSameDay(date, today);
      const completionLevel = getCompletionLevel(completedHabits);

      const completionStyles = {
        none: "bg-background border-border",
        low: "bg-green-950/5 border-green-600/10",
        medium: "bg-green-950/10 border-green-600/20",
        high: "bg-green-950/20 border-green-600/30",
        full: "bg-green-950/30 border-green-600/40",
      };

      return (
        <Tooltip key={day}>
          <TooltipTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => handleKeyPress(e, date)}
              aria-label={format(date, "EEEE, MMMM do, yyyy")}
              className={`group relative h-16 cursor-pointer border p-2 transition-all hover:border-green-600/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                completionStyles[completionLevel]
              } ${isCurrentDay ? "relative z-10 ring-2 ring-primary ring-offset-2" : ""}`}
            >
              <time
                dateTime={format(date, "yyyy-MM-dd")}
                className="absolute left-2 top-2 text-sm font-medium"
              >
                {day}
              </time>
              {completedHabits.length > 0 && (
                <div className="absolute bottom-2 right-2 flex h-5 items-center">
                  {Array.from({ length: habits.length }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-[3px] w-[3px] rounded-full ${
                        i < completedHabits.length ? "bg-green-600" : "bg-muted"
                      } ${i > 0 ? "ml-[2px]" : ""}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent
            sideOffset={5}
            className="w-72 border-2 bg-popover p-3 text-base shadow-md"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="font-medium">{format(date, "EEEE, MMMM do")}</div>
              <div className="text-sm text-muted-foreground">
                {completedHabits.length}/{habits.length} completed
              </div>
            </div>
            <div className="space-y-2">
              {habits.map((habit) => {
                const isCompleted = completedHabits.some(
                  (h) => h.id === habit.id
                );
                const streak = streaks.get(habit.id) ?? 0;
                const monthlyCount = monthStats.get(habit.id) ?? 0;

                return (
                  <div
                    key={habit.id}
                    className={`flex items-center justify-between rounded-md p-1 text-sm ${
                      isCompleted ? "bg-green-500/10" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          isCompleted ? "bg-green-500" : "bg-muted"
                        }`}
                      />
                      <span>{habit.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{monthlyCount} this month</span>
                      {streak > 0 && (
                        <span className="font-medium text-orange-500">
                          {streak}🔥
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TooltipContent>
        </Tooltip>
      );
    },
    [
      currentMonth,
      getHabitsForDate,
      handleKeyPress,
      today,
      habits,
      streaks,
      monthStats,
    ]
  );

  const renderCalendar = useCallback(() => {
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="relative h-16 p-4 text-muted-foreground"
          aria-hidden="true"
        />
      );
    }

    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(renderDay(day));
    }

    return days;
  }, [firstDayOfMonth, daysInMonth, renderDay]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 rounded bg-muted" />
        <div className="rounded-md border shadow-sm">
          <div className="grid grid-cols-7 gap-px">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div
          className="flex items-center justify-between"
          role="group"
          aria-label="Calendar navigation"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1
                )
              )
            }
            aria-label="Previous month"
          >
            Previous
          </Button>
          <h3 className="text-lg font-medium" aria-live="polite">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1
                )
              )
            }
            aria-label="Next month"
          >
            Next
          </Button>
        </div>

        <div
          className="overflow-visible rounded-md border shadow-sm"
          role="grid"
          aria-label="Calendar"
        >
          <div className="grid grid-cols-7 border-b text-center" role="row">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-4 text-sm font-medium text-muted-foreground"
                role="columnheader"
                aria-label={day}
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7" role="presentation">
            {renderCalendar()}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
