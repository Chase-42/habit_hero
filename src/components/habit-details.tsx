"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Target } from "lucide-react";
import { format } from "date-fns";

import { Card } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import type { Habit } from "~/types";
import { cn } from "~/lib/utils";

interface HabitDetailsProps {
  habit: Habit;
}

export function HabitDetails({ habit }: HabitDetailsProps) {
  const categoryColors = {
    mindfulness: "text-blue-500",
    nutrition: "text-green-500",
    fitness: "text-red-500",
    productivity: "text-purple-500",
    other: "text-gray-500",
  };

  const bgColors = {
    mindfulness: "bg-blue-50 dark:bg-blue-950/30",
    nutrition: "bg-green-50 dark:bg-green-950/30",
    fitness: "bg-red-50 dark:bg-red-950/30",
    productivity: "bg-purple-50 dark:bg-purple-950/30",
    other: "bg-gray-50 dark:bg-gray-950/30",
  };

  const progressPercentage = habit.goal
    ? Math.min(100, (habit.streak / habit.goal) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={cn(
          "mt-1 space-y-4 rounded-b-lg border-t p-4",
          bgColors[habit.category]
        )}
      >
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar
                className={cn("h-4 w-4", categoryColors[habit.category])}
              />
              <div className="text-sm">
                <span className="text-muted-foreground">Created </span>
                <span>{format(new Date(habit.createdAt), "MMM d, yyyy")}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock
                className={cn("h-4 w-4", categoryColors[habit.category])}
              />
              <div className="text-sm">
                <span className="text-muted-foreground">Longest streak </span>
                <span>{habit.longestStreak} days</span>
              </div>
            </div>
          </div>

          {habit.goal && (
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Target
                    className={cn("h-4 w-4", categoryColors[habit.category])}
                  />
                  <span>Goal Progress</span>
                </div>
                <span className="text-muted-foreground">
                  {habit.streak} / {habit.goal} days
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {habit.notes && (
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="text-sm">{habit.notes}</p>
            </div>
          )}

          {habit.metricType && habit.units && (
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Tracking</p>
              <p className="text-sm">
                {habit.metricType} ({habit.units})
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
