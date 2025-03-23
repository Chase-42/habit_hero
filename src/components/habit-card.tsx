"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { Habit } from "~/types";
import { cn } from "~/lib/utils";

interface HabitCardProps {
  habit: Habit;
  onToggleComplete: () => void;
  onDelete: () => void;
  onExpand: () => void;
  isExpanded: boolean;
}

export function HabitCard({
  habit,
  onToggleComplete,
  onDelete,
  onExpand,
  isExpanded,
}: HabitCardProps) {
  const [isCheckAnimating, setIsCheckAnimating] = useState(false);

  const isCompleted = habit.lastCompleted !== null;

  const handleComplete = () => {
    if (!isCompleted) {
      setIsCheckAnimating(true);
      setTimeout(() => setIsCheckAnimating(false), 1000);
    }
    onToggleComplete();
  };

  const getFrequencyText = () => {
    switch (habit.frequencyType) {
      case "daily":
        return "Daily";
      case "weekly":
        if (habit.frequencyValue.days?.length) {
          const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          return `Weekly: ${habit.frequencyValue.days.map((day) => dayNames[day]).join(", ")}`;
        }
        return "Weekly";
      case "monthly":
        return "Monthly";
      default:
        return "";
    }
  };

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

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        bgColors[habit.category]
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  "text-lg font-medium",
                  isCompleted && "text-muted-foreground line-through"
                )}
              >
                {habit.name}
              </h3>
              <span
                className={cn(
                  "text-sm font-medium",
                  categoryColors[habit.category]
                )}
              >
                {habit.category}
              </span>
            </div>

            <p className="text-sm text-muted-foreground">{habit.description}</p>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{getFrequencyText()}</span>
              {habit.streak > 0 && (
                <span className="font-medium text-amber-500">
                  {habit.streak} day streak 🔥
                </span>
              )}
              {isCompleted && habit.lastCompleted && (
                <span>
                  Completed{" "}
                  {formatDistanceToNow(new Date(habit.lastCompleted), {
                    addSuffix: true,
                  })}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                isCompleted
                  ? cn(
                      "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                    )
                  : "bg-white text-muted-foreground hover:text-foreground dark:bg-gray-800"
              )}
              onClick={handleComplete}
              whileTap={{ scale: 0.9 }}
            >
              <CheckCircle2 className="h-5 w-5" />
              {isCheckAnimating && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-green-500/20"
                  initial={{ scale: 0.5, opacity: 0.8 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.8 }}
                />
              )}
            </motion.button>

            <div className="flex">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onExpand}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
