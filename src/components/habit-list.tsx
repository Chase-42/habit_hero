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
<<<<<<< Updated upstream
        {habits.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-center">
            <p className="text-muted-foreground">No habits to display</p>
          </div>
        ) : (
          habits.map((habit) => (
            <Card key={habit.id}>
=======
        {filteredHabits.map((habit) => {
          const completed = isCompletedToday(habit);
          return (
            <Card
              key={habit.id}
              className={cn(
                "relative border shadow-sm",
                "transition-all duration-300",
                "hover:border-primary/20 hover:shadow-md",
                completed && "bg-muted"
              )}
            >
>>>>>>> Stashed changes
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-3 w-3 rounded-full",
                      habit.color === "red" && "bg-red-500",
                      habit.color === "green" && "bg-green-500",
                      habit.color === "blue" && "bg-blue-500",
                      habit.color === "yellow" && "bg-yellow-500",
                      habit.color === "purple" && "bg-purple-500",
                      habit.color === "pink" && "bg-pink-500",
                      habit.color === "orange" && "bg-orange-500"
                    )}
                  />
                  <Link
                    href={`/habits/${habit.id}`}
                    className="hover:text-primary hover:underline"
                  >
                    {habit.name}
                  </Link>
                </CardTitle>
                <CardDescription>{getFrequencyText(habit)}</CardDescription>
              </CardHeader>
<<<<<<< Updated upstream
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
=======

              <CardContent className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{habit.streak}</span>
                  <span className="text-muted-foreground">day streak</span>
>>>>>>> Stashed changes
                </div>

                <Button
<<<<<<< Updated upstream
                  variant={isCompletedToday(habit) ? "default" : "outline"}
                  onClick={() => onComplete(habit.id)}
                >
                  {isCompletedToday(habit) ? "Completed" : "Complete"}
=======
                  variant={completed ? "outline" : "default"}
                  size="sm"
                  onClick={() => {
                    console.log("Complete button clicked for habit:", habit);
                    void onComplete(habit);
                  }}
                  className={cn(
                    "min-w-[100px]",
                    "transition-all duration-300",
                    completed && [
                      "bg-green-500/10 hover:bg-green-500/20",
                      "border-green-500/20 hover:border-green-500/30",
                      "text-green-700 dark:text-green-500",
                    ]
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    {completed && (
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    <span>{completed ? "Completed" : "Complete"}</span>
                  </div>
>>>>>>> Stashed changes
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
