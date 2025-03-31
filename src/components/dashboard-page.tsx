"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { AddHabitModal } from "~/components/add-habit-modal";
import { HabitCalendar } from "~/components/habit-calendar";
import { HabitList } from "~/components/habit-list";
import { StreakHeatmap } from "~/components/streak-heatmap";
import { Header } from "~/components/header";
import { StatsCards } from "~/components/stats-cards";
import { useHabitOperations } from "~/hooks/use-habit-operations";
import { ScrollArea } from "~/components/ui/scroll-area";

export function DashboardPage() {
  const { user } = useUser();
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);

  const {
    habits,
    habitLogs,
    isLoading,
    error,
    completingHabits,
    deletingHabits,
    addHabit,
    completeHabit,
    deleteHabit,
    getTodayHabits,
  } = useHabitOperations({
    userId: user?.id ?? "",
  });

  return (
    <div className="flex h-screen flex-col">
      <Header
        onAddHabit={() => setIsAddHabitOpen(true)}
        isLoading={isLoading}
      />

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
                <Card className="overflow-hidden rounded-sm">
                  <CardHeader className="px-3 pb-2 pt-3">
                    <h3 className="text-sm font-medium">Completion History</h3>
                    <p className="text-xs text-muted-foreground">
                      Your habit completion patterns over time
                    </p>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
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
                  <CardContent className="p-0">
                    <ScrollArea className="h-[300px]">
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

        {error && (
          <div className="mx-2 mt-2 rounded-sm border border-destructive bg-destructive/10 p-1.5 text-sm text-destructive">
            {error}
          </div>
        )}
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
