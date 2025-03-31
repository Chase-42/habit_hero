"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

import { Button } from "~/components/ui/button";
import { ThemeToggle } from "~/components/theme-toggle";
import { HeaderActions } from "~/components/header-actions";

export function Header() {
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
        <HeaderActions />
      </div>
    </header>
  );
}
