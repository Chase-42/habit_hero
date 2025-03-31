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
import { useHabitOperations } from "~/hooks/use-habit-operations";

export function HeaderActions() {
  const { user } = useUser();
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);

  const { isLoading, addHabit } = useHabitOperations({
    userId: user?.id ?? "",
  });

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
            onClick={() => setIsAddHabitOpen(true)}
            disabled={isLoading}
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
        open={isAddHabitOpen}
        onOpenChange={setIsAddHabitOpen}
        onAddHabit={addHabit}
        userId={user?.id ?? ""}
      />
    </>
  );
}
