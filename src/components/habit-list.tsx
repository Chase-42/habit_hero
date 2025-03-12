"use client";

import { useState, useEffect } from "react";
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

interface HabitListProps {
  habits: any[];
  onComplete: (id: string) => void;
  showAll?: boolean;
}

export function HabitList({
  habits,
  onComplete,
  showAll = false,
}: HabitListProps) {
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedHabit(expandedHabit === id ? null : id);
  };

  const isCompletedToday = (habit: any) => {
    return habit.completedDates?.includes(today);
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
            <div
              key={habit.id}
              className={cn(
                "group relative rounded-lg border p-4 transition-all",
                expandedHabit === habit.id
                  ? "bg-muted/50"
                  : "hover:bg-muted/50",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className={getColorClasses(
                      habit.color,
                      isCompletedToday(habit),
                    )}
                    onClick={() => onComplete(habit.id)}
                  >
                    <Check className="h-4 w-4" />
                    <span className="sr-only">Complete</span>
                  </Button>
                  <div>
                    <div className="font-medium">{habit.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {habit.frequency === "daily"
                        ? "Daily"
                        : habit.frequency === "weekdays"
                          ? "Weekdays"
                          : "Custom days"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={getBadgeClasses(habit.color)}
                  >
                    {habit.streak} day streak
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleExpand(habit.id)}
                  >
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        expandedHabit === habit.id && "rotate-90",
                      )}
                    />
                    <span className="sr-only">Details</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/habits/${habit.id}`}>View Details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {expandedHabit === habit.id && (
                <div className="mt-4 space-y-2 pl-11">
                  {habit.goal && (
                    <div className="text-sm">
                      <span className="font-medium">Goal:</span> {habit.goal}
                    </div>
                  )}
                  {habit.notes && (
                    <div className="text-sm">
                      <span className="font-medium">Notes:</span> {habit.notes}
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">Category:</span>{" "}
                    {habit.category.charAt(0).toUpperCase() +
                      habit.category.slice(1)}
                  </div>
                  {habit.reminder && (
                    <div className="text-sm">
                      <span className="font-medium">Reminder:</span>{" "}
                      {habit.reminder}
                    </div>
                  )}
                  <Button variant="outline" size="sm" asChild className="mt-2">
                    <Link href={`/habits/${habit.id}`}>View Full Details</Link>
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
