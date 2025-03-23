import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-2xl font-bold hover:text-primary">
              HabitHero
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
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
                <Link href="/signup">
                  <Button size="lg">Start Your Journey</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg">
                    View Demo
                  </Button>
                </Link>
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
