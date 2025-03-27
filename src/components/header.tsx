import { Plus, ChevronRight, Settings } from "lucide-react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import { ThemeToggle } from "~/components/theme-toggle";

interface HeaderProps {
  onAddHabit: () => void;
  isLoading?: boolean;
}

export function Header({ onAddHabit, isLoading = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-2xl font-bold hover:text-primary">
            HabitHero
          </Link>
          <SignedIn>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ChevronRight className="h-4 w-4" />
              <Link href="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
            </div>
          </SignedIn>
        </div>
        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="default">Sign In</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Button onClick={onAddHabit} disabled={isLoading} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Habit
            </Button>
            <ThemeToggle />
            <UserButton />
          </SignedIn>
          {/* <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </Link> */}
        </div>
      </div>
    </header>
  );
}
