"use client";

import { useState } from "react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { HabitCard } from "~/components/habit-card";
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

// Types
interface HabitListProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  onComplete: (habit: Habit) => void;
  onDelete: (habit: Habit) => Promise<void>;
  onEdit?: (habit: Habit) => void;
  onArchive?: (habit: Habit) => void;
  onToggleReminder?: (habit: Habit) => void;
  onViewStats?: (habit: Habit) => void;
  showAll?: boolean;
  userId: string;
}

// Components
const DeleteHabitDialog = ({
  habit,
  isOpen,
  isDeleting,
  onConfirm,
  onOpenChange,
}: {
  habit: Habit | null;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onOpenChange: (isOpen: boolean) => void;
}) => (
  <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete Habit</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete &quot;{habit?.name}&quot;? This action
          cannot be undone and will permanently delete the habit and all its
          history.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
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
);

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
}: HabitListProps) {
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
                  lastCompleted: isHabitCompletedToday(habit, habitLogs)
                    ? new Date()
                    : null,
                }}
                onToggleComplete={() => onComplete(habit)}
                onDelete={() => setHabitToDelete(habit)}
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
              />
            </div>
          ))}
        </div>
      </ScrollArea>

      <DeleteHabitDialog
        habit={habitToDelete}
        isOpen={habitToDelete !== null}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onOpenChange={(isOpen) => !isOpen && setHabitToDelete(null)}
      />
    </>
  );
}
