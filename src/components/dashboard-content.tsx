"use client";

import { Calendar } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useMemo, useState, useEffect } from "react";
import { FrequencyType } from "~/types/common/enums";
import { toggleHabit } from "~/lib/api";
import type { Habit, HabitLog } from "~/types";
import type { ApiResponse } from "~/types/api/validation";
import { logger } from "~/lib/logger";
import {
  getToday,
  getTomorrow,
  getStartOfMonth,
  getEndOfMonth,
  isSameDay,
  formatDate,
} from "~/lib/utils/dates";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { HabitCalendar } from "~/components/habit-calendar";
import { HabitList } from "~/components/habit-list";
import { StreakHeatmap } from "~/components/streak-heatmap";
import { StatsCards } from "~/components/stats-cards";
import { useAddHabit, useDeleteHabit } from "~/hooks/use-habit-operations";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import { fetchHabits, fetchHabitLogs } from "~/lib/api";
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
import {
  getTodayHabits as getTodayHabitsUtil,
  isHabitCompletedOnDate,
} from "~/lib/utils/habits";

export function DashboardContent() {
  const { user } = useUser();
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [completingHabits, setCompletingHabits] = useState<Set<string>>(
    new Set()
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const addHabitMutation = useAddHabit();
  const deleteHabitMutation = useDeleteHabit();

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      const response = await fetchHabits();
      logger.debug("[HABITS] Fetched habits data:", {
        context: "habits_fetch",
        data: response.map((h) => ({
          id: h.id,
          name: h.name,
          isActive: h.isActive,
          isArchived: h.isArchived,
          frequencyType: h.frequencyType,
          frequencyValue: h.frequencyValue,
          createdAt: h.createdAt,
        })),
      });
      return response;
    },
  });

  const todayHabits = useMemo(() => {
    logger.debug("[HABITS] Calculating today's habits", {
      context: "today_habits",
      data: {
        totalHabits: habits.length,
        habits: habits.map((h) => ({
          id: h.id,
          name: h.name,
          isActive: h.isActive,
          isArchived: h.isArchived,
          frequencyType: h.frequencyType,
          frequencyValue: h.frequencyValue,
        })),
      },
    });
    const result = getTodayHabitsUtil(habits);
    logger.debug("[HABITS] Today's habits result", {
      context: "today_habits",
      data: {
        totalHabits: habits.length,
        todayHabitsCount: result.length,
        todayHabits: result.map((h) => ({
          id: h.id,
          name: h.name,
          frequencyType: h.frequencyType,
        })),
      },
    });
    return result;
  }, [habits]);

  const { data: habitLogs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ["habitLogs"],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      logger.debug("[HABIT_LOGS] Starting fetch for all habits", {
        context: "habit_logs_fetch",
        data: { userId: user.id },
      });

      const startOfMonth = getStartOfMonth();
      const endOfMonth = getEndOfMonth();

      logger.debug("[HABIT_LOGS] Date range", {
        context: "habit_logs_fetch",
        data: {
          start: startOfMonth.toISOString(),
          end: endOfMonth.toISOString(),
        },
      });

      const logs = await Promise.all(
        habits.map(async (habit) => {
          logger.debug("[HABIT_LOGS] Fetching logs for habit", {
            context: "habit_logs_fetch",
            data: {
              habitId: habit.id,
              habitName: habit.name,
            },
          });
          const habitLogs = await fetchHabitLogs(
            habit.id,
            startOfMonth,
            endOfMonth,
            user.id
          );
          logger.debug("[HABIT_LOGS] Found logs for habit", {
            context: "habit_logs_fetch",
            data: {
              habitId: habit.id,
              habitName: habit.name,
              logCount: habitLogs.length,
            },
          });
          return habitLogs;
        })
      );

      const flattenedLogs = logs.flat();
      logger.debug("[HABIT_LOGS] Total logs fetched", {
        context: "habit_logs_fetch",
        data: { count: flattenedLogs.length },
      });
      return flattenedLogs;
    },
    enabled: !!habits && !!user?.id,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
  });

  // Add logging for when habits change
  useEffect(() => {
    logger.debug("[HABITS] Habits updated", {
      context: "habits_update",
      data: { count: habits.length },
    });
  }, [habits]);

  // Add logging for when logs change
  useEffect(() => {
    logger.debug("[LOGS] Logs updated", {
      context: "logs_update",
      data: { count: habitLogs.length },
    });
  }, [habitLogs]);

  const completeHabitMutation = useMutation({
    mutationFn: async (habit: Habit) => {
      if (!user?.id) throw new Error("User not authenticated");
      const isCompleted = habitLogs.some(
        (log) =>
          log.habitId === habit.id &&
          isSameDay(new Date(log.completedAt), getToday())
      );
      logger.debug("[HABIT] Toggling habit completion", {
        context: "habit_toggle",
        data: {
          habitId: habit.id,
          habitName: habit.name,
          isCurrentlyCompleted: isCompleted,
        },
      });

      const result = await toggleHabit(habit, isCompleted);
      return result;
    },
    onSuccess: (data) => {
      logger.debug("[HABIT] Habit toggled successfully", {
        context: "habit_toggle",
        data: {
          habitId: data.habit.id,
          habitName: data.habit.name,
          lastCompleted: data.habit.lastCompleted,
          streak: data.habit.streak,
        },
      });

      // Update the habits query data
      queryClient.setQueryData<Habit[]>(
        ["habits"],
        (old) =>
          old?.map((h) => (h.id === data.habit.id ? data.habit : h)) ?? []
      );

      // Update the habit logs query data for this specific habit
      queryClient.setQueryData<HabitLog[]>(["habitLogs"], (old) => {
        if (!old) return data.logs;

        // Remove existing logs for this habit in the current month
        const filteredLogs = old.filter(
          (log) =>
            log.habitId !== data.habit.id ||
            !isSameDay(new Date(log.completedAt), new Date())
        );

        // Add the new logs
        return [...filteredLogs, ...data.logs];
      });
    },
    onError: (error: Error) => {
      logger.error("[HABIT] Failed to toggle habit", {
        context: "habit_toggle",
        data: {
          error: error.message,
        },
      });
    },
  });

  const completeHabit = async (habit: Habit) => {
    await completeHabitMutation.mutateAsync(habit);
  };

  const handleAddHabit = async (
    habit: Omit<
      Habit,
      "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
    >
  ) => {
    try {
      await addHabitMutation.mutateAsync(habit);
      toast.success("Habit created successfully!");
    } catch (err) {
      console.error("Error creating habit:", err);
      toast.error("Failed to create habit. Please try again.");
      throw err;
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!habitToDelete) return;

    try {
      queryClient.setQueryData<Habit[]>(["habits"], (old = []) =>
        old.filter((h) => h.id !== habitToDelete.id)
      );

      await deleteHabitMutation.mutateAsync(habitToDelete.id);
      toast.success(`${habitToDelete.name} deleted successfully`);
      setHabitToDelete(null);
    } catch (error) {
      await queryClient.invalidateQueries({ queryKey: ["habits"] });
      console.error("Error deleting habit:", error);
      toast.error("Failed to delete habit. Please try again.");
    }
  };

  const stats = useMemo(() => {
    logger.debug("[DASHBOARD_STATS] Calculating stats", {
      context: "stats_calculation",
      data: {
        habitsCount: habits.length,
        logsCount: habitLogs.length,
        habits: habits.map((h) => ({
          id: h.id,
          name: h.name,
          isActive: h.isActive,
          isArchived: h.isArchived,
          streak: h.streak,
          lastCompleted: h.lastCompleted,
          frequencyType: h.frequencyType,
          frequencyValue: h.frequencyValue,
        })),
      },
    });

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
            frequencyType: h.frequencyType,
            frequencyValue: h.frequencyValue,
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
        completedAt.setHours(0, 0, 0, 0);
        return (
          log.habitId === habit.id && completedAt.getTime() === today.getTime()
        );
      })
    );

    // Calculate weekly progress
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6); // Last 7 days including today

    // Calculate total possible completions based on frequency
    let totalPossibleCompletions = 0;
    const weeklyLogs = habitLogs.filter((log) => {
      const completedAt = new Date(log.completedAt);
      completedAt.setHours(0, 0, 0, 0);
      return completedAt >= weekStart && completedAt <= today;
    });

    for (const habit of activeHabits) {
      if (habit.frequencyType === FrequencyType.Daily) {
        totalPossibleCompletions += 7; // Daily habits can be completed every day
      } else if (habit.frequencyType === FrequencyType.Weekly) {
        // Weekly habits can be completed on specific days
        const days = habit.frequencyValue.days ?? [];
        totalPossibleCompletions += days.length;
      }
    }

    const weeklyProgress =
      totalPossibleCompletions > 0
        ? Math.round((weeklyLogs.length / totalPossibleCompletions) * 100)
        : 0;

    // Calculate current streak
    let currentStreak = 0;
    for (const habit of activeHabits) {
      if (habit.lastCompleted) {
        const lastCompleted = new Date(habit.lastCompleted);
        lastCompleted.setHours(0, 0, 0, 0);
        const daysSinceLastCompletion = Math.floor(
          (today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastCompletion === 0) {
          // Habit was completed today
          currentStreak = Math.max(currentStreak, (habit.streak || 0) + 1);
        } else if (daysSinceLastCompletion === 1) {
          // Habit was completed yesterday
          currentStreak = Math.max(currentStreak, habit.streak || 0);
        }
      }
    }

    const result = {
      totalHabits: activeHabits.length,
      completedToday: completedToday.length,
      weeklyProgress,
      currentStreak,
    };

    console.log(
      "[DASHBOARD_STATS] Calculations:",
      JSON.stringify(
        {
          today: today.toISOString(),
          weekStart: weekStart.toISOString(),
          activeHabits: activeHabits.map((h) => ({
            id: h.id,
            name: h.name,
            frequencyType: h.frequencyType,
            frequencyValue: h.frequencyValue,
          })),
          completedToday: completedToday.map((h) => ({
            id: h.id,
            name: h.name,
          })),
          weeklyLogs: weeklyLogs.map((l) => ({
            habitId: l.habitId,
            completedAt: l.completedAt,
          })),
          totalPossibleCompletions,
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
                <Card className="flex flex-col overflow-hidden">
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
    <main className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      <header className="flex-none border-b bg-background px-4 py-3">
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

      <div className="flex-1 overflow-hidden">
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

          <div className="flex-1 overflow-hidden">
            <TabsContent value="overview" className="h-full">
              <div className="flex h-full flex-col gap-4 p-4">
                <div className="grid flex-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatsCards habits={habits} habitLogs={habitLogs} />
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                  <Card className="flex flex-col overflow-hidden">
                    <CardHeader className="flex-none">
                      <h3 className="text-sm font-medium">
                        Completion History
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Your habit completion patterns over time
                      </p>
                    </CardHeader>
                    <CardContent className="min-h-0 flex-1 p-0">
                      <ScrollArea className="h-full">
                        <div className="p-4">
                          <StreakHeatmap
                            habits={habits}
                            habitLogs={habitLogs}
                          />
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <Card className="flex flex-col overflow-hidden">
                    <CardHeader className="flex-none">
                      <h3 className="text-sm font-medium">
                        Today&apos;s Habits
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Habits to complete today
                      </p>
                    </CardHeader>
                    <CardContent className="min-h-0 flex-1 p-0">
                      <ScrollArea className="h-full">
                        <div className="space-y-2 p-4">
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
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="habits" className="h-full p-4">
              <Card className="flex h-full flex-col">
                <CardHeader className="flex-none">
                  <h3 className="text-sm font-medium">All Habits</h3>
                  <p className="text-xs text-muted-foreground">
                    Manage all your habits
                  </p>
                </CardHeader>
                <CardContent className="min-h-0 flex-1 p-0">
                  <ScrollArea className="h-full">
                    <div className="p-4">
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

            <TabsContent value="calendar" className="h-full p-4">
              <Card className="flex h-full flex-col">
                <CardHeader className="flex-none">
                  <h3 className="text-sm font-medium">Habit Calendar</h3>
                  <p className="text-xs text-muted-foreground">
                    View your habit completion history
                  </p>
                </CardHeader>
                <CardContent className="min-h-0 flex-1 p-0">
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      <HabitCalendar habits={habits} habitLogs={habitLogs} />
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
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
