"use client";

import { Calendar } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useMemo, useState, useEffect } from "react";
import { FrequencyType } from "~/types/common/enums";
import { toggleHabit } from "~/lib/api-client";
import type { Habit, HabitLog } from "~/types";
import { isSameDay, startOfDay } from "date-fns";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { HabitCalendar } from "~/components/habit-calendar";
import { HabitList } from "~/components/habit-list";
import { StreakHeatmap } from "~/components/streak-heatmap";
import { StatsCards } from "~/components/stats-cards";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import { fetchHabits, fetchHabitLogs } from "~/lib/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AddHabitModal } from "~/components/add-habit-modal";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { useHabitOperations } from "~/hooks/use-habit-operations";

export function DashboardContent() {
  const { user } = useUser();
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const response = await fetchHabits(user?.id ?? "");
      return response;
    },
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["habitLogs"],
    queryFn: async () => {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 30); // Last 30 days
      const response = await Promise.all(
        habits.map((habit) => fetchHabitLogs(habit.id, startDate, today))
      );
      return response.flat();
    },
    enabled: habits.length > 0,
  });

  const { completingHabits, completeHabit, getTodayHabits } =
    useHabitOperations({
      userId: user?.id ?? "",
      habits,
      habitLogs: logs,
      onHabitsChange: (updatedHabits) => {
        queryClient.setQueryData(["habits"], updatedHabits);
      },
      onLogsChange: (updatedLogs) => {
        queryClient.setQueryData(["habitLogs"], updatedLogs);
      },
    });

  const handleAddHabit = async (
    habit: Omit<
      Habit,
      "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
    >
  ) => {
    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(habit),
      });

      if (!response.ok) {
        throw new Error("Failed to create habit");
      }

      const result = (await response.json()) as Habit;
      queryClient.setQueryData<Habit[]>(["habits"], (old = []) => [
        ...old,
        result,
      ]);
      toast.success("Habit created successfully!");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create habit";
      console.error("Error creating habit:", errorMessage);
      toast.error("Failed to create habit. Please try again.");
      throw err;
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!habitToDelete) return;

    try {
      const response = await fetch(`/api/habits/${habitToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete habit");
      }

      queryClient.setQueryData<Habit[]>(["habits"], (old = []) =>
        old.filter((h) => h.id !== habitToDelete.id)
      );
      queryClient.setQueryData<HabitLog[]>(["habitLogs"], (old = []) =>
        old.filter((log) => log.habitId !== habitToDelete.id)
      );

      toast.success(`${habitToDelete.name} deleted successfully`);
      setHabitToDelete(null);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete habit";
      console.error("Error deleting habit:", errorMessage);
      toast.error("Failed to delete habit. Please try again.");
    }
  };

  const todayHabits = useMemo(() => getTodayHabits(), [getTodayHabits, habits]);

  const completeHabitMutation = useMutation({
    mutationFn: async ({ habit }: { habit: Habit }) => {
      console.log("[TOGGLE] Before toggle:", {
        habitId: habit.id,
        name: habit.name,
        lastCompleted: habit.lastCompleted,
      });
      const result = await toggleHabit(habit);
      console.log("[TOGGLE] After toggle:", {
        habitId: result.id,
        name: result.name,
        lastCompleted: result.lastCompleted,
      });
      return result;
    },
    onMutate: async ({ habit }) => {
      await queryClient.cancelQueries({ queryKey: ["habits"] });
      const previousHabits =
        queryClient.getQueryData<Habit[]>(["habits"]) ?? [];

      queryClient.setQueryData<Habit[]>(["habits"], (old = []) =>
        old.map((h) => {
          if (h.id === habit.id) {
            const updatedHabit = {
              ...h,
              lastCompleted: h.lastCompleted ? null : startOfDay(new Date()),
            };
            console.log("[OPTIMISTIC] Updating habit:", {
              id: h.id,
              name: h.name,
              oldLastCompleted: h.lastCompleted,
              newLastCompleted: updatedHabit.lastCompleted,
            });
            return updatedHabit;
          }
          return h;
        })
      );

      completingHabits.add(habit.id);
      return { previousHabits };
    },
    onError: (err: unknown, variables, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData<Habit[]>(["habits"], context.previousHabits);
      }
      completingHabits.delete(variables.habit.id);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });

  const { data: habitLogs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ["habitLogs"],
    queryFn: async () => {
      console.log("[HABIT_LOGS] Starting fetch for all habits");
      const today = startOfDay(new Date());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      // Set proper time for start and end dates
      startOfMonth.setHours(0, 0, 0, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      console.log("[HABIT_LOGS] Date range:", {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString(),
      });

      const logs = await Promise.all(
        habits.map(async (habit) => {
          console.log(
            `[HABIT_LOGS] Fetching logs for habit: ${habit.name} (${habit.id})`
          );
          const habitLogs = await fetchHabitLogs(
            habit.id,
            startOfMonth,
            endOfMonth
          );
          console.log(
            `[HABIT_LOGS] Found ${habitLogs.length} logs for ${habit.name}`
          );
          return habitLogs;
        })
      );

      const flattenedLogs = logs.flat();
      console.log("[HABIT_LOGS] Total logs fetched:", flattenedLogs.length);
      return flattenedLogs;
    },
    enabled: !!habits,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
  });

  // Add logging for when habits change
  useEffect(() => {
    console.log("[HABITS] Habits updated:", habits.length);
  }, [habits]);

  // Add logging for when logs change
  useEffect(() => {
    console.log("[LOGS] Logs updated:", habitLogs.length);
  }, [habitLogs]);

  const stats = useMemo(() => {
    console.log(
      "[DASHBOARD_STATS] Input data:",
      JSON.stringify(
        {
          habitsCount: habits.length,
          logsCount: habitLogs.length,
          habits: habits.map((h) => ({
            id: h.id,
            name: h.name,
            isActive: h.isActive,
            isArchived: h.isArchived,
            streak: h.streak,
            lastCompleted: h.lastCompleted,
          })),
        },
        null,
        2
      )
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get active habits
    const activeHabits = habits.filter((h) => !h.isArchived && h.isActive);

    // Get completed habits for today
    const completedToday = activeHabits.filter((habit) =>
      habitLogs.some((log) => {
        const completedAt = new Date(log.completedAt);
        const logDate = new Date(
          completedAt.getFullYear(),
          completedAt.getMonth(),
          completedAt.getDate()
        );
        const todayDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        return (
          log.habitId === habit.id && logDate.getTime() === todayDate.getTime()
        );
      })
    );

    // Calculate weekly progress
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6); // Last 7 days including today

    const weeklyLogs = habitLogs.filter((log) => {
      const completedAt = new Date(log.completedAt);
      const logDate = new Date(
        completedAt.getFullYear(),
        completedAt.getMonth(),
        completedAt.getDate()
      );
      const weekStartDate = new Date(
        weekStart.getFullYear(),
        weekStart.getMonth(),
        weekStart.getDate()
      );
      const todayDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      return logDate >= weekStartDate && logDate <= todayDate;
    });

    // Calculate total possible completions for the week
    const totalPossibleCompletions = activeHabits.length * 7;
    const weeklyProgress =
      totalPossibleCompletions > 0
        ? Math.round((weeklyLogs.length / totalPossibleCompletions) * 100)
        : 0;

    const result = {
      totalHabits: activeHabits.length,
      completedToday: completedToday.length,
      weeklyProgress,
      currentStreak: Math.max(...activeHabits.map((h) => h.streak || 0)),
    };

    console.log(
      "[DASHBOARD_STATS] Calculations:",
      JSON.stringify(
        {
          today: today.toISOString(),
          weekStart: weekStart.toISOString(),
          activeHabits: activeHabits.map((h) => ({ id: h.id, name: h.name })),
          completedToday: completedToday.map((h) => ({
            id: h.id,
            name: h.name,
          })),
          weeklyLogs: weeklyLogs.map((l) => ({
            habitId: l.habitId,
            completedAt: l.completedAt,
          })),
          result,
        },
        null,
        2
      )
    );

    return result;
  }, [habits, habitLogs]);

  console.log(habits);

  if (isLoading) {
    return (
      <main className="flex h-[calc(100vh-5.5rem)] flex-col overflow-hidden">
        <div className="border-b bg-background">
          <div className="px-3 py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Skeleton className="h-7 w-32 sm:h-8" />
                <Skeleton className="mt-1 h-4 w-48" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="overview" className="space-y-3">
            <TabsList className="w-full rounded-none px-3">
              <TabsTrigger value="overview" className="flex-1 text-sm">
                Overview
              </TabsTrigger>
              <TabsTrigger value="habits" className="flex-1 text-sm">
                My Habits
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex-1 text-sm">
                Calendar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-3">
              <div className="grid grid-cols-2 gap-3 px-3 sm:grid-cols-2 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card
                    key={i}
                    className="min-h-[140px] w-[289px] overflow-hidden rounded-sm"
                  >
                    <CardHeader className="px-3 pb-1 pt-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="mt-1 h-3 w-32" />
                    </CardHeader>
                    <CardContent className="px-3 pb-2">
                      <Skeleton className="h-16 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 px-3 md:grid-cols-2">
                <Card className="flex flex-col overflow-hidden rounded-sm">
                  <CardHeader className="px-3 pb-2 pt-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-1 h-3 w-48" />
                  </CardHeader>
                  <CardContent className="flex-1 px-3 pb-3">
                    <Skeleton className="h-[300px] w-full" />
                  </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-sm">
                  <CardHeader className="px-3 pb-2 pt-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-1 h-3 w-32" />
                  </CardHeader>
                  <CardContent className="relative p-0">
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-3 px-3 pb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="habits">
              <Card className="mx-2 overflow-hidden rounded-sm">
                <CardHeader className="px-2 pb-1.5 pt-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-1 h-3 w-32" />
                </CardHeader>
                <CardContent className="px-2 pb-2">
                  <div className="h-[500px] overflow-y-auto">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 py-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar">
              <Card className="mx-2 overflow-hidden rounded-sm">
                <CardHeader className="px-2 pb-1.5 pt-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-1 h-3 w-48" />
                </CardHeader>
                <CardContent className="px-2 pb-2">
                  <Skeleton className="h-[400px] w-full" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col">
      <header className="border-b bg-background px-4 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold sm:text-2xl">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Track and manage your daily habits
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        <Tabs defaultValue="overview" className="flex h-full flex-col">
          <TabsList className="flex-none border-b px-4">
            <TabsTrigger value="overview" className="flex-1">
              Overview
            </TabsTrigger>
            <TabsTrigger value="habits" className="flex-1">
              My Habits
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex-1">
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="overview"
            className="flex min-h-0 flex-1 flex-col space-y-4 p-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatsCards habits={habits} habitLogs={habitLogs} />
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2">
              <Card className="flex flex-col">
                <CardHeader className="flex-none">
                  <h3 className="text-sm font-medium">Completion History</h3>
                  <p className="text-xs text-muted-foreground">
                    Your habit completion patterns over time
                  </p>
                </CardHeader>
                <CardContent className="min-h-0 flex-1">
                  <StreakHeatmap habits={habits} habitLogs={habitLogs} />
                </CardContent>
              </Card>

              <Card className="flex flex-col">
                <CardHeader className="flex-none">
                  <h3 className="text-sm font-medium">Today&apos;s Habits</h3>
                  <p className="text-xs text-muted-foreground">
                    Habits to complete today
                  </p>
                </CardHeader>
                <CardContent className="relative min-h-0 flex-1 p-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-3 p-4">
                      <HabitList
                        habits={todayHabits}
                        habitLogs={habitLogs}
                        onComplete={completeHabit}
                        onDelete={async (habit) => {
                          setHabitToDelete(habit);
                          return Promise.resolve();
                        }}
                        userId={user?.id ?? ""}
                        completingHabits={completingHabits}
                      />
                    </div>
                  </ScrollArea>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="habits" className="min-h-0 flex-1 p-4">
            <Card className="flex h-full flex-col">
              <CardHeader className="flex-none">
                <h3 className="text-sm font-medium">All Habits</h3>
                <p className="text-xs text-muted-foreground">
                  Manage all your habits
                </p>
              </CardHeader>
              <CardContent className="min-h-0 flex-1">
                <ScrollArea className="h-full">
                  <div className="space-y-3">
                    <HabitList
                      habits={habits}
                      habitLogs={habitLogs}
                      onComplete={completeHabit}
                      onDelete={async (habit) => {
                        setHabitToDelete(habit);
                        return Promise.resolve();
                      }}
                      userId={user?.id ?? ""}
                      completingHabits={completingHabits}
                    />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="min-h-0 flex-1 p-4">
            <Card className="flex h-full flex-col">
              <CardHeader className="flex-none">
                <h3 className="text-sm font-medium">Habit Calendar</h3>
                <p className="text-xs text-muted-foreground">
                  View your habit completion history
                </p>
              </CardHeader>
              <CardContent className="min-h-0 flex-1">
                <ScrollArea className="h-full">
                  <HabitCalendar habits={habits} habitLogs={habitLogs} />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AddHabitModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAddHabit={handleAddHabit}
        userId={user?.id ?? ""}
      />

      <AlertDialog
        open={!!habitToDelete}
        onOpenChange={() => setHabitToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Habit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this habit? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
