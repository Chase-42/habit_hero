"use client";

import Link from "next/link";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { Habit, HabitLog } from "~/types";

interface HabitListProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  onComplete: (habit: Habit) => void | Promise<void>;
  showAll?: boolean;
}

export function HabitList({
  habits,
  habitLogs,
  onComplete,
  showAll = false,
}: HabitListProps) {
  const isCompletedToday = (habit: Habit) => {
    const today = new Date().toISOString().split("T")[0];
    console.log("Checking completion for habit:", habit.id);
    console.log("Today's date:", today);
    console.log("Available logs:", habitLogs);
    const completed = habitLogs.some((log) => {
      const logDate = new Date(log.completedAt).toISOString().split("T")[0];
      console.log("Log date:", logDate, "for habit:", log.habitId);
      return log.habitId === habit.id && logDate === today;
    });
    console.log("Is completed:", completed);
    return completed;
  };

  const getFrequencyText = (habit: Habit) => {
    if (habit.frequencyType === "daily") return "Daily";

    if (habit.frequencyType === "weekly") {
      const days = habit.frequencyValue.days
        ?.map((day) =>
          new Date(0, 0, day).toLocaleDateString("en-US", { weekday: "short" })
        )
        .join(", ");
      return `Weekly (${days})`;
    }

    if (habit.frequencyType === "monthly") {
      return "Monthly";
    }

    return "";
  };

  const filteredHabits = showAll ? habits : habits.filter((h) => h.isActive);

  if (filteredHabits.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        No habits to display
      </div>
    );
  }

  return (
    <ScrollArea className={showAll ? "h-[500px]" : "h-auto"}>
      <div className="space-y-2">
        {filteredHabits.map((habit) => {
          const completed = isCompletedToday(habit);
          return (
            <Card
              key={habit.id}
              className={cn("transition-colors", completed && "bg-muted")}
            >
              <CardHeader className="pb-3">
                <CardTitle>
                  <Link
                    href={`/habits/${habit.id}`}
                    className="hover:underline hover:opacity-80"
                  >
                    {habit.name}
                  </Link>
                </CardTitle>
                <CardDescription>{getFrequencyText(habit)}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between pb-2">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full",
                        habit.color === "red" && "bg-red-500",
                        habit.color === "green" && "bg-green-500",
                        habit.color === "blue" && "bg-blue-500",
                        habit.color === "yellow" && "bg-yellow-500",
                        habit.color === "purple" && "bg-purple-500",
                        habit.color === "pink" && "bg-pink-500",
                        habit.color === "orange" && "bg-orange-500"
                      )}
                    />
                    <span className="text-sm font-medium">
                      {habit.streak} day streak
                    </span>
                  </div>
                </div>
                <Button
                  variant={completed ? "outline" : "default"}
                  onClick={() => {
                    console.log("Complete button clicked for habit:", habit);
                    void onComplete(habit);
                  }}
                  disabled={completed}
                >
                  {completed ? "Completed" : "Complete"}
                  {process.env.NODE_ENV === "development" && (
                    <span className="ml-2 text-xs opacity-50">
                      (disabled: {String(completed)})
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
