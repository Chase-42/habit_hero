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

export interface HabitListProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  onComplete: (id: string) => void;
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
    return habitLogs.some(
      (log) =>
        log.habitId === habit.id &&
        log.completedAt.toISOString().split("T")[0] === today,
    );
  };

  const getFrequencyText = (habit: Habit) => {
    if (habit.frequencyType === "daily") return "Daily";

    if (habit.frequencyType === "weekly") {
      const days = habit.frequencyValue.days
        ?.map((day) =>
          new Date(0, 0, day).toLocaleDateString("en-US", { weekday: "short" }),
        )
        .join(", ");
      return `Weekly (${days})`;
    }

    if (habit.frequencyType === "monthly") {
      return "Monthly (1st)";
    }

    return "";
  };

  return (
    <ScrollArea className={showAll ? "h-[500px]" : "h-auto"}>
      <div className="space-y-2">
        {habits.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-center">
            <p className="text-muted-foreground">No habits to display</p>
          </div>
        ) : (
          habits.map((habit) => (
            <Card key={habit.id}>
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
                        habit.color === "orange" && "bg-orange-500",
                      )}
                    />
                    <span className="text-sm font-medium">
                      {habit.streak} day streak
                    </span>
                  </div>
                </div>
                <Button
                  variant={isCompletedToday(habit) ? "default" : "outline"}
                  onClick={() => onComplete(habit.id)}
                >
                  {isCompletedToday(habit) ? "Completed" : "Complete"}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
