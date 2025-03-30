"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
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
import { StreakHeatmap } from "~/components/streak-heatmap";
import { Header } from "~/components/header";
import { StatsCards } from "~/components/stats-cards";
import { useHabitOperations } from "~/hooks/use-habit-operations";
import type { Habit } from "~/types";

type NewHabit = Omit<
  Habit,
  "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
>;

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
                            onComplete={completeHabit}
                            onDelete={deleteHabit}
                            userId={user?.id ?? ""}
                            completingHabits={completingHabits}
                            deletingHabits={deletingHabits}
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
                        onComplete={completeHabit}
                        onDelete={deleteHabit}
                        userId={user?.id ?? ""}
                        completingHabits={completingHabits}
                        deletingHabits={deletingHabits}
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
