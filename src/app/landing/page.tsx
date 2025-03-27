"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link
              href="/landing"
              className="text-2xl font-bold hover:text-primary"
            >
              HabitHero
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <SignInButton mode="modal">
              <Button variant="ghost">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button>Get Started</Button>
            </SignUpButton>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
                Build Better Habits,{" "}
                <span className="text-primary">Transform Your Life</span>
              </h1>
              <p className="mb-8 text-xl text-muted-foreground">
                Track, analyze, and improve your daily habits with HabitHero.
                Simple, effective, and designed to help you succeed.
              </p>
              <div className="flex justify-center gap-4">
                <SignUpButton mode="modal">
                  <Button size="lg">Start Your Journey</Button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </SignInButton>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/50 py-20">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-2 text-lg font-semibold">
                  Track Daily Habits
                </h3>
                <p className="text-muted-foreground">
                  Easily track and monitor your daily habits with our intuitive
                  interface.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-2 text-lg font-semibold">
                  Visualize Progress
                </h3>
                <p className="text-muted-foreground">
                  See your progress with beautiful charts and detailed
                  analytics.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-2 text-lg font-semibold">Stay Motivated</h3>
                <p className="text-muted-foreground">
                  Build streaks and celebrate your achievements as you grow.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} HabitHero. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
