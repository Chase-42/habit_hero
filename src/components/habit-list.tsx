"use client";

import { useState } from "react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { HabitCard } from "~/components/habit-card";
import { HabitDetails } from "~/components/habit-details";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import type { Habit, HabitLog } from "~/types";
import { toast } from "sonner";

interface HabitListProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  onComplete: (habit: Habit) => void;
  onDelete: (habit: Habit) => Promise<void>;
  showAll?: boolean;
  userId: string;
}

export function HabitList({
  habits,
  habitLogs,
  onComplete,
  onDelete,
  showAll = false,
}: HabitListProps) {
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedHabitId((current) => (current === id ? null : id));
  };

  const isCompletedToday = (habit: Habit) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return habitLogs.some(
      (log) =>
        log.habitId === habit.id &&
        new Date(log.completedAt).setHours(0, 0, 0, 0) === today.getTime()
    );
  };

  const handleDelete = async () => {
    if (!habitToDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(habitToDelete);
      toast.success(`${habitToDelete.name} deleted successfully`);
    } catch {
      toast.error("Failed to delete habit. Please try again.");
    } finally {
      setIsDeleting(false);
      setHabitToDelete(null);
    }
  };

  return (
    <>
      <ScrollArea className={showAll ? "h-[500px]" : "h-auto"}>
        <div className="space-y-3 p-1">
          {habits.map((habit) => (
            <div key={habit.id}>
              <HabitCard
                habit={{
                  ...habit,
                  lastCompleted: isCompletedToday(habit) ? new Date() : null,
                }}
                onToggleComplete={() => onComplete(habit)}
                onDelete={() => setHabitToDelete(habit)}
                onExpand={() => toggleExpand(habit.id)}
                isExpanded={expandedHabitId === habit.id}
              />
              {expandedHabitId === habit.id && <HabitDetails habit={habit} />}
            </div>
          ))}
        </div>
      </ScrollArea>

      <AlertDialog
        open={habitToDelete !== null}
        onOpenChange={(isOpen) => !isOpen && setHabitToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Habit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{habitToDelete?.name}&quot;?
              This action cannot be undone and will permanently delete the habit
              and all its history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="mr-2">Deleting...</span>
                  <span className="animate-spin">⏳</span>
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
