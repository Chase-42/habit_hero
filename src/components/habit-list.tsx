"use client";

import { useState } from "react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { HabitCard } from "~/components/habit-card";
import type { Habit, HabitLog } from "~/types";
import { AnimatePresence, motion } from "framer-motion";

// Types
export interface HabitListProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  onComplete: (habit: Habit) => Promise<void>;
  onDelete: (habit: Habit) => Promise<void>;
  onEdit?: (habit: Habit) => void;
  onArchive?: (habit: Habit) => void;
  onToggleReminder?: (habit: Habit) => void;
  onViewStats?: (habit: Habit) => void;
  showAll?: boolean;
  userId: string;
  completingHabits?: Set<string>;
}

// Utility functions
const isHabitCompletedToday = (
  habit: Habit,
  habitLogs: HabitLog[]
): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return habitLogs.some(
    (log) =>
      log.habitId === habit.id &&
      new Date(log.completedAt).setHours(0, 0, 0, 0) === today.getTime()
  );
};

// Main component
export function HabitList({
  habits,
  habitLogs,
  onComplete,
  onDelete,
  onEdit,
  onArchive,
  onToggleReminder,
  onViewStats,
  showAll = false,
  userId,
  completingHabits = new Set(),
}: HabitListProps) {
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);

  return (
    <ScrollArea className={showAll ? "h-[500px]" : "h-auto"}>
      <div className="space-y-3 p-1">
        <AnimatePresence initial={false} mode="sync">
          {habits.map((habit) => (
            <motion.div
              key={habit.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                x: -100,
                transition: {
                  duration: 0.2,
                  ease: "easeInOut",
                },
              }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
            >
              <HabitCard
                habit={habit}
                onToggleComplete={() => onComplete(habit)}
                onDelete={() => onDelete(habit)}
                onExpand={() =>
                  setExpandedHabitId((id) =>
                    id === habit.id ? null : habit.id
                  )
                }
                isExpanded={expandedHabitId === habit.id}
                onEdit={onEdit ? () => onEdit(habit) : undefined}
                onArchive={onArchive ? () => onArchive(habit) : undefined}
                onToggleReminder={
                  onToggleReminder ? () => onToggleReminder(habit) : undefined
                }
                onViewStats={onViewStats ? () => onViewStats(habit) : undefined}
                isLoading={completingHabits.has(habit.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}
