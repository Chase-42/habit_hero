"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import type {
  Habit,
  FrequencyType,
  HabitCategory,
} from "~/entities/models/habit";
import { cn } from "~/lib/utils";
import { FREQUENCY_OPTIONS } from "~/frameworks/next/types/ui/habit";

// Constants for frequency types
const FREQUENCY_MAP: Record<FrequencyType, string> = {
  daily: "times per day",
  weekly: "times per week",
  monthly: "times per month",
};

// Constants for category icons
const CATEGORY_ICONS: Record<HabitCategory, string> = {
  mindfulness: "🧘‍♂️",
  nutrition: "🥗",
  fitness: "💪",
  productivity: "📚",
  other: "✨",
};

interface HabitCardProps {
  habit: Habit;
  onToggleComplete: () => void;
  onDelete: () => void;
  onExpand: () => void;
  isExpanded: boolean;
}

const CompletionButton = ({
  isCompleted,
  onClick,
}: {
  isCompleted: boolean;
  onClick: () => void;
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (!isCompleted) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
    onClick();
  };

  return (
    <motion.button
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors",
        isCompleted
          ? "bg-green-500 text-white"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
      onClick={handleClick}
      whileTap={{ scale: 0.9 }}
    >
      <AnimatePresence mode="wait">
        {isCompleted ? (
          <motion.div
            key="check"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <CheckCircle2 className="h-5 w-5" />
          </motion.div>
        ) : (
          <motion.div
            key="circle"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="h-5 w-5 rounded-full border-2 border-current"
          />
        )}
      </AnimatePresence>

      {isAnimating && (
        <motion.div
          className="absolute inset-0 rounded-full bg-green-500"
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      )}
    </motion.button>
  );
};

export function HabitCard({
  habit,
  onToggleComplete,
  onDelete,
  onExpand,
  isExpanded,
}: HabitCardProps) {
  const isCompleted = habit.lastCompleted !== null;

  const getFrequencyText = () => {
    const frequencyText = FREQUENCY_MAP[habit.frequencyType as FrequencyType];

    if (habit.frequencyType === "weekly" && habit.frequencyValue.days?.length) {
      const dayNames = habit.frequencyValue.days
        .map((day) => {
          const date = new Date(0);
          date.setDate(day);
          return date.toLocaleDateString("en-US", { weekday: "long" });
        })
        .join(", ");
      return `${habit.frequencyValue.times} ${frequencyText} on ${dayNames}`;
    }

    return `${habit.frequencyValue.times} ${frequencyText}`;
  };

  const getCategoryIcon = () => {
    return CATEGORY_ICONS[habit.category as HabitCategory];
  };

  const categoryColors: Record<HabitCategory, string> = {
    mindfulness: "text-blue-500",
    nutrition: "text-green-500",
    fitness: "text-red-500",
    productivity: "text-purple-500",
    other: "text-gray-500",
  };

  const bgColors: Record<HabitCategory, string> = {
    mindfulness: "bg-blue-50 dark:bg-blue-950/30",
    nutrition: "bg-green-50 dark:bg-green-950/30",
    fitness: "bg-red-50 dark:bg-red-950/30",
    productivity: "bg-purple-50 dark:bg-purple-950/30",
    other: "bg-gray-50 dark:bg-gray-950/30",
  };

  return (
    <Card
      className={cn(
        "group relative overflow-visible transition-all duration-300",
        bgColors[habit.category as HabitCategory]
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
                  categoryColors[habit.category as HabitCategory]
                )}
              >
                {getCategoryIcon()}
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
            <CompletionButton
              isCompleted={isCompleted}
              onClick={onToggleComplete}
            />

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
