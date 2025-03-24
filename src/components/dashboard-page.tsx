"use client";

import { useState, useEffect } from "react";
import { Calendar, Plus, Settings, ChevronRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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
import { StreakHeatmap } from "~/components/streak-heatmap";
import { ThemeToggle } from "~/components/theme-toggle";
import type { Habit, HabitLog } from "~/types";
import {
  createHabit,
  fetchHabits,
  toggleHabit,
  fetchTodaysLogs,
  fetchHabitLogs,
} from "~/lib/api-client";

type NewHabit = Omit<
  Habit,
  "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
>;

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
      const habit = await createHabit(newHabit);
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
        const habits = await fetchHabits(userId);
        setHabits(habits);

        // Load logs for the past 84 days for all habits
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 84);

        // Fetch logs for each habit
        const allLogs = await Promise.all(
          habits.map(async (habit) => {
            const logs = await fetchHabitLogs(habit.id, startDate, endDate);
            return logs;
          })
        );
        setHabitLogs(allLogs.flat());
      } catch (err) {
        console.error("Error loading habits:", err);
        setError(err instanceof Error ? err.message : "Failed to load habits");
      } finally {
        setIsLoading(false);
      }
    };

    void loadHabits();
  }, [userId]);

  const handleDeleteHabit = async (habit: Habit) => {
    try {
      const response = await fetch(`/api/habits/${habit.id}?userId=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete habit");
      }

      // Update local state
      setHabits((prevHabits) => prevHabits.filter((h) => h.id !== habit.id));
      setHabitLogs((prevLogs) =>
        prevLogs.filter((log) => log.habitId !== habit.id)
      );
    } catch (error) {
      console.error("Error deleting habit:", error);
      throw error; // Re-throw to be handled by HabitList
    }
  };

  const handleCompleteHabit = async (habit: Habit) => {
    const isCompleted = habit.lastCompleted !== null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Optimistically update UI
    setHabits((prevHabits) =>
      prevHabits.map((h) =>
        h.id === habit.id
          ? {
              ...h,
              streak: isCompleted ? h.streak - 1 : h.streak + 1,
              lastCompleted: isCompleted ? null : today,
            }
          : h
      )
    );

    // Update logs state
    setHabitLogs((prevLogs) => {
      if (isCompleted) {
        // Remove today's log
        return prevLogs.filter(
          (log) =>
            log.habitId !== habit.id ||
            new Date(log.completedAt).setHours(0, 0, 0, 0) !== today.getTime()
        );
      } else {
        // Add today's log
        return [
          ...prevLogs,
          {
            id: crypto.randomUUID(),
            habitId: habit.id,
            userId: habit.userId,
            completedAt: today,
            value: null,
            notes: null,
            details: null,
            difficulty: null,
            feeling: null,
            hasPhoto: false,
            photoUrl: null,
          },
        ];
      }
    });

    try {
      // Make API call
      await toggleHabit(habit, isCompleted);
    } catch (error) {
      // Revert optimistic updates on error
      setHabits((prevHabits) =>
        prevHabits.map((h) =>
          h.id === habit.id
            ? {
                ...h,
                streak: isCompleted ? h.streak + 1 : h.streak - 1,
                lastCompleted: isCompleted ? today : null,
              }
            : h
        )
      );

      setHabitLogs((prevLogs) => {
        if (isCompleted) {
          // Restore today's log
          return [
            ...prevLogs,
            {
              id: crypto.randomUUID(),
              habitId: habit.id,
              userId: habit.userId,
              completedAt: today,
              value: null,
              notes: null,
              details: null,
              difficulty: null,
              feeling: null,
              hasPhoto: false,
              photoUrl: null,
            },
          ];
        } else {
          // Remove today's log
          return prevLogs.filter(
            (log) =>
              log.habitId !== habit.id ||
              new Date(log.completedAt).setHours(0, 0, 0, 0) !== today.getTime()
          );
        }
      });

      console.error("Error toggling habit:", error);
      toast.error("Failed to update habit. Please try again.");
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
            <Link href="/" className="text-2xl font-bold hover:text-primary">
              HabitHero
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ChevronRight className="h-4 w-4" />
              <Link href="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsAddHabitOpen(true)}
              disabled={isLoading}
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Habit
            </Button>
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
                        <CardTitle>Habit Momentum</CardTitle>
                        <CardDescription>
                          Your habits ranked by current streak and completion
                          rate
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <WeeklyProgress habits={habits} habitLogs={habitLogs} />
                      </CardContent>
                    </Card>
                    <Card className="lg:col-span-3">
                      <CardHeader>
                        <CardTitle>Completion History</CardTitle>
                        <CardDescription>
                          Your habit completion patterns over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <StreakHeatmap habits={habits} habitLogs={habitLogs} />
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
                        onComplete={handleCompleteHabit}
                        onDelete={handleDeleteHabit}
                        userId={userId}
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
                        onComplete={handleCompleteHabit}
                        onDelete={handleDeleteHabit}
                        showAll
                        userId={userId}
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
