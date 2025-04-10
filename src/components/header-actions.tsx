"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { ThemeToggle } from "~/components/theme-toggle";
import { AddHabitModal } from "~/components/add-habit-modal";
import { useAddHabit } from "~/hooks/use-habit-operations";
import { useUser } from "@clerk/nextjs";
import type { NewHabit } from "~/types";

export function HeaderActions() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { user } = useUser();
  const addHabitMutation = useAddHabit();

  const handleAddHabit = async (habit: NewHabit) => {
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
          variant="default"
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Habit
        </Button>
        <ThemeToggle />
        <UserButton afterSignOutUrl="/" />
      </SignedIn>

      <AddHabitModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAddHabit={handleAddHabit}
        userId={user?.id ?? ""}
      />
    </div>
  );
}
