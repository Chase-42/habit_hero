import { Plus, ChevronRight } from "lucide-react";
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
      <div className="flex h-14 items-center justify-between px-3">
        <div className="flex items-center gap-1.5">
          <Link
            href="/"
            className="text-lg font-bold hover:text-primary sm:text-xl"
          >
            HabitHero
          </Link>
          <SignedIn>
            <div className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/" className="hover:text-foreground">
                Dashboard
              </Link>
            </div>
          </SignedIn>
        </div>
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
              onClick={onAddHabit}
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
