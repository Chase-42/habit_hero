"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { Habit, HabitLog } from "~/types";

export interface HabitCalendarProps {
  habits: Habit[];
  habitLogs: HabitLog[];
}

type CalendarDay = number | null;

export function HabitCalendar({ habits, habitLogs }: HabitCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const startOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getCalendarDays = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const totalDays = daysInMonth(currentMonth);
    const firstDay = startOfMonth(currentMonth);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add the days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }

    return days;
  };

  const isDateCompleted = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const dateStr = date.toISOString().split("T")[0];

    return habits.some((habit) =>
      habitLogs.some((log) => {
        const completedAt = new Date(log.completedAt);
        return (
          log.habitId === habit.id &&
          completedAt.toISOString().split("T")[0] === dateStr
        );
      })
    );
  };

  const days = getCalendarDays();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() =>
            setCurrentMonth(
              new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() - 1,
                1
              )
            )
          }
        >
          Previous
        </Button>
        <h3 className="text-lg font-semibold">
          {currentMonth.toLocaleDateString("default", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <Button
          variant="outline"
          onClick={() =>
            setCurrentMonth(
              new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() + 1,
                1
              )
            )
          }
        >
          Next
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="grid grid-cols-7 gap-1 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-2 text-sm font-medium">
              {day}
            </div>
          ))}
          {days.map((day, index) => (
            <div
              key={index}
              className={cn(
                "aspect-square p-2",
                day === null
                  ? "bg-muted"
                  : isDateCompleted(day)
                    ? "bg-green-500 text-white"
                    : "bg-card"
              )}
            >
              {day}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
