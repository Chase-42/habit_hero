"use client";

import { Plus } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { ThemeToggle } from "~/components/theme-toggle";
import { AddHabitModal } from "~/components/add-habit-modal";
import { useAddHabit } from "~/hooks/use-habit-operations";
import { toast } from "sonner";
import type { Habit } from "~/types";

export function HeaderActions() {
  const { user } = useUser();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const addHabitMutation = useAddHabit();

  const handleAddHabit = async (
    habit: Omit<
      Habit,
      "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
    >
  ) => {
    try {
      await addHabitMutation.mutateAsync(habit);
      toast.success("Habit created successfully!");
    } catch (err) {
      console.error("Error creating habit:", err);
      toast.error("Failed to create habit. Please try again.");
      throw err;
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="default" size="sm" className="text-sm">
              Sign In
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            className="h-8 px-2 text-sm"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Habit</span>
            <span className="sm:hidden">Add</span>
          </Button>
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>

      <AddHabitModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAddHabit={handleAddHabit}
        userId={user?.id ?? ""}
      />
    </>
  );
}
