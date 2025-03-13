"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
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
import type { Habit } from "~/types";

export interface HabitListProps {
  habits: Habit[];
  onComplete: (id: string) => void;
  showAll?: boolean;
}

export function HabitList({
  habits,
  onComplete,
  showAll = false,
}: HabitListProps) {
  const [today, setToday] = useState<string>("");

  useEffect(() => {
    const dateString = new Date().toISOString().split("T")[0];
    if (dateString) {
      setToday(dateString);
    }
  }, []);

  const isCompletedToday = (habit: Habit): boolean => {
    return Boolean(habit.completedDates?.includes(today));
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
                <CardDescription>
                  {habit.frequency} • {habit.category}
                </CardDescription>
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
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-8 w-8",
                    isCompletedToday(habit) && "bg-green-500 text-white",
                  )}
                  onClick={() => onComplete(habit.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
