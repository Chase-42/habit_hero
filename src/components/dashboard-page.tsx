"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

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
import { WeeklyProgress } from "~/components/weekly-progress";
import { StreakHeatmap } from "~/components/streak-heatmap";
import { Header } from "~/components/header";
import type { Habit, HabitLog } from "~/types";
import { FrequencyType } from "~/types/common/enums";
import {
  createHabit,
  fetchHabits,
  toggleHabit,
  fetchHabitLogs,
} from "~/lib/api-client";
import { StatsCards } from "~/components/stats-cards";

type NewHabit = Omit<
  Habit,
  "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
>;

export function DashboardPage() {
  const { user } = useUser();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addHabit = async (newHabit: NewHabit) => {
    try {
      const habit = await createHabit(newHabit);
      console.log("Added new habit:", habit);
      setHabits((currentHabits) => [...currentHabits, habit]);
      toast.success("Habit created successfully!");
    } catch (err) {
      console.error("Error adding habit:", err);
      setError(err instanceof Error ? err.message : "Failed to create habit");
      toast.error("Failed to create habit. Please try again.");
      throw err; // Re-throw to be handled by the modal
    }
  };

  // Load initial habits
  useEffect(() => {
    if (!user?.id) return;

    const loadHabits = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const habits = await fetchHabits(user.id);
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
  }, [user?.id]);

  const handleDeleteHabit = async (habit: Habit) => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `/api/habits/${habit.id}?userId=${user.id}`,
        {
          method: "DELETE",
        }
      );

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
        const now = new Date();
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
            createdAt: now,
            updatedAt: now,
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
          return prevLogs.filter(
            (log) =>
              log.habitId !== habit.id ||
              new Date(log.completedAt).setHours(0, 0, 0, 0) !== today.getTime()
          );
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

      if (habit.frequencyType === FrequencyType.Daily) return true;

      if (habit.frequencyType === FrequencyType.Weekly) {
        return habit.frequencyValue.days?.includes(today) ?? false;
      }

      // For monthly habits, show them on the 1st of each month
      if (habit.frequencyType === FrequencyType.Monthly) {
        return new Date().getDate() === 1;
      }

      return false;
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        onAddHabit={() => setIsAddHabitOpen(true)}
        isLoading={isLoading}
      />

      <main className="flex-1">
        <div className="container py-6">
          {error && (
            <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="my-8 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold tracking-tight">
                    Dashboard
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Track and manage your daily habits
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="w-full justify-start space-x-2 rounded-none border-b bg-transparent p-0">
                  <TabsTrigger
                    value="overview"
                    className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="habits"
                    className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
                  >
                    My Habits
                  </TabsTrigger>
                  <TabsTrigger
                    value="calendar"
                    className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
                  >
                    Calendar
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4">
                    <StatsCards habits={habits} habitLogs={habitLogs} />

                    <div className="grid gap-4 lg:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Completion History</CardTitle>
                          <CardDescription>
                            Your habit completion patterns over time
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4">
                          <StreakHeatmap
                            habits={habits}
                            habitLogs={habitLogs}
                          />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Today&apos;s Habits</CardTitle>
                          <CardDescription>
                            Habits to complete today
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4">
                          <HabitList
                            habits={getTodayHabits()}
                            habitLogs={habitLogs}
                            onComplete={handleCompleteHabit}
                            onDelete={handleDeleteHabit}
                            userId={user?.id ?? ""}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="habits">
                  <Card>
                    <CardHeader>
                      <CardTitle>All Habits</CardTitle>
                      <CardDescription>Manage all your habits</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <HabitList
                        habits={habits}
                        habitLogs={habitLogs}
                        onComplete={handleCompleteHabit}
                        onDelete={handleDeleteHabit}
                        userId={user?.id ?? ""}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="calendar">
                  <Card>
                    <CardHeader>
                      <CardTitle>Habit Calendar</CardTitle>
                      <CardDescription>
                        View your habit completion history
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
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
        userId={user?.id ?? ""}
      />
    </div>
  );
}
