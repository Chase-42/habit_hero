"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Check, ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
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
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null);
  const [today, setToday] = useState<string>("");

  useEffect(() => {
    const dateString = new Date().toISOString().split("T")[0];
    if (dateString) {
      setToday(dateString);
    }
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedHabit(expandedHabit === id ? null : id);
  };

  const isCompletedToday = (habit: Habit): boolean => {
    return Boolean(habit.completedDates?.includes(today));
  };

  const getColorClasses = (color: string, isCompleted: boolean) => {
    if (isCompleted) {
      return cn(
        "h-8 w-8 rounded-full border-2 transition-all",
        color === "blue"
          ? "bg-blue-500 text-white hover:bg-blue-600"
          : color === "red"
            ? "bg-red-500 text-white hover:bg-red-600"
            : color === "green"
              ? "bg-green-500 text-white hover:bg-green-600"
              : color === "purple"
                ? "bg-purple-500 text-white hover:bg-purple-600"
                : color === "yellow"
                  ? "bg-yellow-500 text-white hover:bg-yellow-600"
                  : color === "pink"
                    ? "bg-pink-500 text-white hover:bg-pink-600"
                    : color === "indigo"
                      ? "bg-indigo-500 text-white hover:bg-indigo-600"
                      : "bg-teal-500 text-white hover:bg-teal-600",
      );
    }
    return "h-8 w-8 rounded-full border-2 transition-all text-muted-foreground hover:border-primary hover:text-primary";
  };

  const getBadgeClasses = (color: string) => {
    return cn(
      "bg-opacity-10 text-xs",
      color === "blue"
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
        : color === "red"
          ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          : color === "green"
            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            : color === "purple"
              ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
              : color === "yellow"
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                : color === "pink"
                  ? "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300"
                  : color === "indigo"
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                    : "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
    );
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
