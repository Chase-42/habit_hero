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
  Check,
  Flame,
  MoreVertical,
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
import { FrequencyType } from "~/types/common/enums";
import { Badge } from "~/components/ui/badge";

// Types
type HabitCategory =
  | "mindfulness"
  | "nutrition"
  | "fitness"
  | "productivity"
  | "other";

export interface HabitCardProps {
  habit: Habit;
  onToggleComplete: (habit: Habit) => Promise<void>;
  onDelete?: (habit: Habit) => Promise<void>;
  onExpand?: (habit: Habit) => void;
  isExpanded?: boolean;
  onEdit?: (habit: Habit) => void;
  onArchive?: (habit: Habit) => void;
  onToggleReminder?: (habit: Habit) => void;
  onViewStats?: (habit: Habit) => void;
  isLoading?: boolean;
  isDeleting?: boolean;
}

// Constants
const ICON_BUTTON_STYLES = "h-8 w-8 hover:bg-zinc-100 dark:hover:bg-zinc-800";
const DROPDOWN_ITEM_STYLES =
  "flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800";

const CATEGORY_STYLES: Record<HabitCategory, { text: string; bg: string }> = {
  mindfulness: { text: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
  nutrition: { text: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30" },
  fitness: { text: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30" },
  productivity: {
    text: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/30",
  },
  other: { text: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-950/30" },
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

// Components
const CompletionButton = ({
  isCompleted,
  onClick,
}: {
  isCompleted: boolean;
  onClick: () => void;
}) => (
  <motion.button
    className={cn(
      "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors",
      isCompleted
        ? "bg-green-500 text-white"
        : "bg-muted text-muted-foreground hover:bg-muted/80"
    )}
    onClick={onClick}
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

    <motion.div
      className="absolute inset-0 rounded-full bg-green-500"
      initial={false}
      animate={isCompleted ? { scale: [0.8, 1.4], opacity: [0.5, 0] } : {}}
      transition={{ duration: 0.4 }}
    />
  </motion.button>
);

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
    case FrequencyType.Daily:
      return "Daily";
    case FrequencyType.Weekly:
      if (habit.frequencyValue.days?.length) {
        return `Weekly: ${habit.frequencyValue.days.map((day) => DAY_NAMES[day]).join(", ")}`;
      }
      return "Weekly";
    case FrequencyType.Monthly:
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
  isLoading = false,
  isDeleting = false,
}: HabitCardProps) {
  const isCompleted = habit.lastCompleted !== null;

  return (
    <Card
      className={cn(
        "group relative overflow-visible transition-all duration-300",
        CATEGORY_STYLES[habit.category as HabitCategory].bg
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
                  CATEGORY_STYLES[habit.category as HabitCategory].text
                )}
              >
                {habit.category}
              </span>
            </div>

            <p className="text-sm text-muted-foreground">{habit.description}</p>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{getFrequencyText(habit)}</span>
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
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-8 w-8 shrink-0",
                isCompleted &&
                  "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
              onClick={() => onToggleComplete(habit)}
              disabled={isLoading || isDeleting}
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isCompleted ? "Mark as incomplete" : "Mark as complete"}
              </span>
            </Button>

            <div className="flex">
              {onExpand && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onExpand(habit)}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {isExpanded ? "Show less" : "Show more"}
                  </span>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <MoreVertical className="h-4 w-4" />
                    )}
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[180px] rounded-md bg-white p-2 shadow-md dark:bg-zinc-900"
                >
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={() => onEdit(habit)}
                      className={DROPDOWN_ITEM_STYLES}
                      disabled={isDeleting}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onArchive && (
                    <DropdownMenuItem
                      onClick={() => onArchive(habit)}
                      className={DROPDOWN_ITEM_STYLES}
                      disabled={isDeleting}
                    >
                      <Archive className="h-4 w-4" />
                      Archive
                    </DropdownMenuItem>
                  )}
                  {onToggleReminder && (
                    <DropdownMenuItem
                      onClick={() => onToggleReminder(habit)}
                      className={DROPDOWN_ITEM_STYLES}
                      disabled={isDeleting}
                    >
                      {habit.reminder ? (
                        <>
                          <BellOff className="h-4 w-4" />
                          Disable Reminder
                        </>
                      ) : (
                        <>
                          <Bell className="h-4 w-4" />
                          Enable Reminder
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  {onViewStats && (
                    <DropdownMenuItem
                      onClick={() => onViewStats(habit)}
                      className={DROPDOWN_ITEM_STYLES}
                      disabled={isDeleting}
                    >
                      <BarChart2 className="h-4 w-4" />
                      View Stats
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(habit)}
                        className={cn(
                          DROPDOWN_ITEM_STYLES,
                          "text-destructive hover:!text-destructive"
                        )}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <ExpandedContent habit={habit} />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
