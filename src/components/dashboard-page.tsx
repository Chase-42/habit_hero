"use client";

import { useState, useEffect } from "react";
import { Calendar, Plus, Settings } from "lucide-react";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { AddHabitModal } from "~/components/add-habit-modal";
import { HabitCalendar } from "~/components/habit-calendar";
import { HabitList } from "~/components/habit-list";
import { StatsCards } from "~/components/stats-cards";
import { WeeklyProgress } from "~/components/weekly-progress";
import { HabitCategoryChart } from "~/components/habit-category-chart";
import { mockHabits, mockHabitLogs } from "~/lib/mock-data";
import { ThemeToggle } from "~/components/theme-toggle";
import type { Habit, HabitLog } from "~/types";

type NewHabit = Omit<
  Habit,
  "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
>;

interface ErrorResponse {
  error: {
    message: string;
  };
}

export function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = "user123"; // TODO: Get from auth

  const addHabit = async (newHabit: NewHabit) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newHabit),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;
        throw new Error(errorData.error?.message || "Failed to create habit");
      }

      const habit = (await response.json()) as Habit;
      console.log("Added new habit:", habit);
      setHabits((currentHabits) => [...currentHabits, habit]);
      setIsAddHabitOpen(false);
    } catch (err) {
      console.error("Error adding habit:", err);
      setError(err instanceof Error ? err.message : "Failed to create habit");
      throw err; // Re-throw to be handled by the modal
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial habits
  useEffect(() => {
    const loadHabits = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/habits?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to load habits");
        }
        const habits = (await response.json()) as Habit[];
        setHabits(habits);
      } catch (err) {
        console.error("Error loading habits:", err);
        setError(err instanceof Error ? err.message : "Failed to load habits");
      } finally {
        setIsLoading(false);
      }
    };

    void loadHabits();
  }, [userId]);

  const completeHabit = (id: string) => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Check if already completed today
    const existingLog = habitLogs.find(
      (log) =>
        log.habitId === id &&
        log.completedAt.toISOString().split("T")[0] === today,
    );

    if (existingLog) {
      // Remove the log if already completed
      setHabitLogs((currentLogs) =>
        currentLogs.filter((log) => log.id !== existingLog.id),
      );

      // Update streak
      setHabits((currentHabits) =>
        currentHabits.map((habit) =>
          habit.id === id
            ? {
                ...habit,
                streak: Math.max(0, habit.streak - 1),
                lastCompleted:
                  habitLogs
                    .filter(
                      (log) => log.habitId === id && log.id !== existingLog.id,
                    )
                    .sort(
                      (a, b) =>
                        b.completedAt.getTime() - a.completedAt.getTime(),
                    )[0]?.completedAt ?? null,
              }
            : habit,
        ),
      );
    } else {
      // Add new log
      const newLog: HabitLog = {
        id: Date.now().toString(),
        habitId: id,
        userId,
        completedAt: now,
        value: null,
        notes: null,
        details: null,
        difficulty: null,
        feeling: null,
        hasPhoto: false,
        photoUrl: null,
      };

      setHabitLogs((currentLogs) => [...currentLogs, newLog]);

      // Update streak and last completed
      setHabits((currentHabits) =>
        currentHabits.map((habit) =>
          habit.id === id
            ? {
                ...habit,
                streak: habit.streak + 1,
                longestStreak: Math.max(habit.longestStreak, habit.streak + 1),
                lastCompleted: now,
              }
            : habit,
        ),
      );
    }
  };

  const getTodayHabits = () => {
    const today = new Date().getDay();
    return habits.filter((habit) => {
      if (!habit.isActive || habit.isArchived) return false;

      if (habit.frequencyType === "daily") return true;

      if (habit.frequencyType === "weekly") {
        return habit.frequencyValue.days?.includes(today) ?? false;
      }

      // For monthly habits, show them on the 1st of each month
      if (habit.frequencyType === "monthly") {
        return new Date().getDate() === 1;
      }

      return false;
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">HabitHero</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <Button
              onClick={() => setIsAddHabitOpen(true)}
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Habit
            </Button>
          </div>

          {error && (
            <div className="my-4 rounded-md bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="my-8 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <>
              <StatsCards habits={habits} habitLogs={habitLogs} />

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="habits">My Habits</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="lg:col-span-4">
                      <CardHeader>
                        <CardTitle>Weekly Progress</CardTitle>
                        <CardDescription>
                          Your habit completion for the past week
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <WeeklyProgress habits={habits} habitLogs={habitLogs} />
                      </CardContent>
                    </Card>
                    <Card className="lg:col-span-3">
                      <CardHeader>
                        <CardTitle>Habits by Category</CardTitle>
                        <CardDescription>
                          Distribution of your habits by category
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <HabitCategoryChart habits={habits} />
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Today&apos;s Habits</CardTitle>
                      <CardDescription>
                        Habits to complete today
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <HabitList
                        habits={getTodayHabits()}
                        habitLogs={habitLogs}
                        onComplete={completeHabit}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="habits">
                  <Card>
                    <CardHeader>
                      <CardTitle>All Habits</CardTitle>
                      <CardDescription>Manage all your habits</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <HabitList
                        habits={habits}
                        habitLogs={habitLogs}
                        onComplete={completeHabit}
                        showAll
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="calendar">
                  <Card>
                    <CardHeader className="flex flex-row items-center">
                      <div>
                        <CardTitle>Habit Calendar</CardTitle>
                        <CardDescription>
                          View your habit completion history
                        </CardDescription>
                      </div>
                      <Calendar className="ml-auto h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <HabitCalendar habits={habits} habitLogs={habitLogs} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
      <AddHabitModal
        open={isAddHabitOpen}
        onOpenChange={setIsAddHabitOpen}
        onAddHabit={addHabit}
        userId={userId}
        isLoading={isLoading}
      />
    </div>
  );
}
