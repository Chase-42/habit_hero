"use client";

import { Calendar } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { HabitCalendar } from "~/components/habit-calendar";
import { HabitList } from "~/components/habit-list";
import { StreakHeatmap } from "~/components/streak-heatmap";
import { StatsCards } from "~/components/stats-cards";
import { useHabitOperations } from "~/hooks/use-habit-operations";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";

export function DashboardContent() {
  const { user } = useUser();

  const {
    habits,
    habitLogs,
    isLoading,
    completingHabits,
    deletingHabits,
    completeHabit,
    deleteHabit,
    getTodayHabits,
  } = useHabitOperations({
    userId: user?.id ?? "",
  });

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto">
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

        <div className="pt-3">
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
                  <Card key={i} className="overflow-hidden rounded-sm">
                    <CardHeader className="px-3 pb-2 pt-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="mt-1 h-3 w-32" />
                    </CardHeader>
                    <CardContent className="px-3 pb-3">
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 px-3 md:grid-cols-2">
                <Card className="overflow-hidden rounded-sm">
                  <CardHeader className="px-3 pb-2 pt-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-1 h-3 w-48" />
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <Skeleton className="h-[200px] w-full" />
                  </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-sm">
                  <CardHeader className="px-3 pb-2 pt-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-1 h-3 w-32" />
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3 px-3 pb-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
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
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
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
    <main className="flex-1 overflow-y-auto">
      <div className="border-b bg-background">
        <div className="px-3 py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg font-semibold sm:text-2xl">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Track and manage your daily habits
              </p>
            </div>
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
      </div>

      <div className="pt-3">
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
              <StatsCards habits={habits} habitLogs={habitLogs} />
            </div>

            <div className="grid grid-cols-1 gap-3 px-3 md:grid-cols-2">
              <Card className="flex flex-col overflow-hidden rounded-sm">
                <CardHeader className="px-3 pb-2 pt-3">
                  <h3 className="text-sm font-medium">Completion History</h3>
                  <p className="text-xs text-muted-foreground">
                    Your habit completion patterns over time
                  </p>
                </CardHeader>
                <CardContent className="flex-1 px-3 pb-3">
                  <StreakHeatmap habits={habits} habitLogs={habitLogs} />
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-sm">
                <CardHeader className="px-3 pb-2 pt-3">
                  <h3 className="text-sm font-medium">Today&apos;s Habits</h3>
                  <p className="text-xs text-muted-foreground">
                    Habits to complete today
                  </p>
                </CardHeader>
                <CardContent className="relative p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3 px-3 pb-3">
                      <HabitList
                        habits={getTodayHabits()}
                        habitLogs={habitLogs}
                        onComplete={completeHabit}
                        onDelete={deleteHabit}
                        userId={user?.id ?? ""}
                        completingHabits={completingHabits}
                        deletingHabits={deletingHabits}
                      />
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
                <h3 className="text-sm font-medium">All Habits</h3>
                <p className="text-xs text-muted-foreground">
                  Manage all your habits
                </p>
              </CardHeader>
              <CardContent className="px-2 pb-2">
                <div className="h-[500px] overflow-y-auto">
                  <HabitList
                    habits={habits}
                    habitLogs={habitLogs}
                    onComplete={completeHabit}
                    onDelete={deleteHabit}
                    userId={user?.id ?? ""}
                    completingHabits={completingHabits}
                    deletingHabits={deletingHabits}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card className="mx-2 overflow-hidden rounded-sm">
              <CardHeader className="px-2 pb-1.5 pt-2">
                <h3 className="text-sm font-medium">Habit Calendar</h3>
                <p className="text-xs text-muted-foreground">
                  View your habit completion history
                </p>
              </CardHeader>
              <CardContent className="px-2 pb-2">
                <HabitCalendar habits={habits} habitLogs={habitLogs} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
