"use client";

import { useState } from "react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { HabitCard } from "~/components/habit-card";
import { HabitDetails } from "~/components/habit-details";
import type { Habit, HabitLog } from "~/types";

interface HabitListProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  onComplete: (habit: Habit) => void;
  showAll?: boolean;
}

export function HabitList({
  habits: initialHabits,
  habitLogs,
  onComplete,
  showAll = false,
}: HabitListProps) {
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);

  const handleDelete = async (habit: Habit) => {
    try {
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete habit");
    } catch (err) {
      console.error("Error deleting habit:", err);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedHabitId((current) => (current === id ? null : id));
  };

  const isCompletedToday = (habit: Habit) => {
    const today = new Date().toISOString().split("T")[0];
    return habitLogs.some(
      (log) =>
        log.habitId === habit.id &&
        new Date(log.completedAt).toISOString().split("T")[0] === today
    );
  };

  return (
    <ScrollArea className={showAll ? "h-[500px]" : "h-auto"}>
      <div className="space-y-3 p-1">
        {initialHabits.map((habit) => (
          <div key={habit.id}>
            <HabitCard
              habit={{
                ...habit,
                lastCompleted: isCompletedToday(habit) ? new Date() : null,
              }}
              onToggleComplete={() => onComplete(habit)}
              onDelete={() => handleDelete(habit)}
              onExpand={() => toggleExpand(habit.id)}
              isExpanded={expandedHabitId === habit.id}
            />
            {expandedHabitId === habit.id && <HabitDetails habit={habit} />}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
