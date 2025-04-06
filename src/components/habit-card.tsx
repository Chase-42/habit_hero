"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Trash2,
  Edit,
  Archive,
  Bell,
  BellOff,
  BarChart2,
  Calendar,
  Trophy,
  Target,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import type { Habit } from "~/types";
import { cn } from "~/lib/utils";
import { FrequencyType, HabitCategory } from "~/types/common/enums";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "~/components/ui/alert-dialog";

// Types
type HabitCategoryStyle = {
  text: string;
  bg: string;
};

interface HabitCardProps {
  habit: Habit;
  onToggleComplete: () => void;
  onDelete: () => void;
  onExpand: () => void;
  isExpanded: boolean;
  onEdit?: () => void;
  onArchive?: () => void;
  onToggleReminder?: () => void;
  onViewStats?: () => void;
  isLoading?: boolean;
}

// Constants
const ICON_BUTTON_STYLES = "h-8 w-8 hover:bg-zinc-100 dark:hover:bg-zinc-800";
const DROPDOWN_ITEM_STYLES =
  "flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800";

const DEFAULT_CATEGORY_STYLE = {
  text: "text-gray-500",
  bg: "bg-gray-50 dark:bg-gray-950/30",
};

const CATEGORY_STYLES: Record<HabitCategory, HabitCategoryStyle> = {
  [HabitCategory.HEALTH]: {
    text: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  [HabitCategory.FITNESS]: {
    text: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
  },
  [HabitCategory.MENTAL]: {
    text: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/30",
  },
  [HabitCategory.PRODUCTIVITY]: {
    text: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950/30",
  },
  [HabitCategory.RELATIONSHIPS]: {
    text: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-950/30",
  },
  [HabitCategory.FINANCE]: {
    text: "text-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
  },
  [HabitCategory.EDUCATION]: {
    text: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
  },
  [HabitCategory.CREATIVITY]: {
    text: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/30",
  },
  [HabitCategory.SPIRITUAL]: {
    text: "text-teal-500",
    bg: "bg-teal-50 dark:bg-teal-950/30",
  },
  [HabitCategory.OTHER]: DEFAULT_CATEGORY_STYLE,
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

// Components
const CompletionButton = ({
  isCompleted,
  onClick,
  isLoading,
}: {
  isCompleted: boolean;
  onClick: () => void;
  isLoading?: boolean;
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (isAnimating || isLoading) return;
    setIsAnimating(true);
    onClick();
  };

  return (
    <motion.button
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors",
        isCompleted
          ? "bg-green-500 text-white"
          : "bg-muted text-muted-foreground hover:bg-muted/80",
        (isAnimating || isLoading) && "opacity-80"
      )}
      onClick={handleClick}
      whileTap={{ scale: 0.9 }}
      initial={false}
      animate={{
        backgroundColor: isCompleted ? "rgb(34 197 94)" : "var(--muted)",
        color: isCompleted ? "white" : "var(--muted-foreground)",
      }}
    >
      <AnimatePresence
        mode="wait"
        initial={false}
        onExitComplete={() => setIsAnimating(false)}
      >
        {isCompleted ? (
          <motion.div
            key="check"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <CheckCircle2 className="h-5 w-5" />
          </motion.div>
        ) : (
          <motion.div
            key="circle"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
            className="h-5 w-5 rounded-full border-2 border-current"
          />
        )}
      </AnimatePresence>

      <motion.div
        className="absolute inset-0 rounded-full bg-green-500"
        initial={false}
        animate={
          isCompleted
            ? { scale: [0.8, 1.4], opacity: [0.5, 0] }
            : { scale: 0, opacity: 0 }
        }
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
};

const ExpandedContent = ({ habit }: { habit: Habit }) => (
  <div className="mt-4 space-y-3 border-t border-border/50 pt-4">
    <div className="grid grid-cols-2 gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>Created {format(new Date(habit.createdAt), "MMM d, yyyy")}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Trophy className="h-4 w-4" />
        <span>Longest streak {habit.longestStreak} days</span>
      </div>
    </div>

    {habit.goal && (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>Goal Progress</span>
          </div>
          <span className="font-medium">
            {habit.streak} / {habit.goal} days
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-300"
            style={{
              width: `${Math.min(100, (habit.streak / habit.goal) * 100)}%`,
            }}
          />
        </div>
      </div>
    )}

    {habit.notes && (
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Notes</span>
        </div>
        <p className="text-sm text-muted-foreground">{habit.notes}</p>
      </div>
    )}

    {habit.reminder && (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Bell className="h-4 w-4" />
        <span>Reminder at {format(new Date(habit.reminder), "h:mm a")}</span>
      </div>
    )}
  </div>
);

// Utility functions
const getFrequencyText = (habit: Habit): string => {
  switch (habit.frequencyType) {
    case FrequencyType.DAILY:
      return "Daily";
    case FrequencyType.WEEKLY:
      if (habit.frequencyValue.days?.length) {
        return `Weekly: ${habit.frequencyValue.days.map((day) => DAY_NAMES[day]).join(", ")}`;
      }
      return "Weekly";
    case FrequencyType.MONTHLY:
      return "Monthly";
    default:
      return "";
  }
};

// Main component
export function HabitCard({
  habit,
  onToggleComplete,
  onDelete,
  onExpand,
  isExpanded,
  onEdit,
  onArchive,
  onToggleReminder,
  onViewStats,
  isLoading,
}: HabitCardProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastCompleted = habit.lastCompleted
    ? new Date(habit.lastCompleted)
    : null;
  const isCompleted = lastCompleted ? lastCompleted >= today : false;

  console.log(
    "[HABIT-CARD] State:\n" +
      JSON.stringify(
        {
          habitId: habit.id,
          habitTitle: habit.name,
          lastCompleted,
          today,
          isCompleted,
          rawLastCompleted: habit.lastCompleted,
        },
        null,
        2
      )
  );

  const handleDelete = () => {
    try {
      onDelete();
      toast.success("Habit deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to delete ${habit.name}`
      );
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <CompletionButton
              isCompleted={isCompleted}
              onClick={onToggleComplete}
              isLoading={isLoading}
            />
            <div className="space-y-1">
              <h3 className="font-medium">{habit.name}</h3>
              <p className="text-sm text-muted-foreground">
                {getFrequencyText(habit)}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={ICON_BUTTON_STYLES}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onEdit && (
                <DropdownMenuItem
                  className={DROPDOWN_ITEM_STYLES}
                  onClick={onEdit}
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
              )}
              {onViewStats && (
                <DropdownMenuItem
                  className={DROPDOWN_ITEM_STYLES}
                  onClick={onViewStats}
                >
                  <BarChart2 className="h-4 w-4" />
                  <span>View Stats</span>
                </DropdownMenuItem>
              )}
              {onToggleReminder && (
                <DropdownMenuItem
                  className={DROPDOWN_ITEM_STYLES}
                  onClick={onToggleReminder}
                >
                  {habit.reminderEnabled ? (
                    <>
                      <BellOff className="h-4 w-4" />
                      <span>Disable Reminder</span>
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4" />
                      <span>Enable Reminder</span>
                    </>
                  )}
                </DropdownMenuItem>
              )}
              {onArchive && (
                <DropdownMenuItem
                  className={DROPDOWN_ITEM_STYLES}
                  onClick={onArchive}
                >
                  <Archive className="h-4 w-4" />
                  <span>Archive</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={cn(DROPDOWN_ITEM_STYLES, "text-red-500")}
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                (habit.category && CATEGORY_STYLES[habit.category]?.text) ||
                  DEFAULT_CATEGORY_STYLE.text,
                (habit.category && CATEGORY_STYLES[habit.category]?.bg) ||
                  DEFAULT_CATEGORY_STYLE.bg
              )}
            >
              {habit.category || HabitCategory.OTHER}
            </span>
            <span className="text-sm text-muted-foreground">
              {habit.streak} day{habit.streak !== 1 ? "s" : ""} streak
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={ICON_BUTTON_STYLES}
            onClick={onExpand}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {isExpanded && <ExpandedContent habit={habit} />}
      </CardContent>
    </Card>
  );
}
