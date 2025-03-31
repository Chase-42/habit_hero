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

      <main className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-2xl">Dashboard</h1>
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

        <div className="px-4">
          <Tabs defaultValue="overview" className="space-y-3">
            <TabsList className="bg-background">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="habits">My Habits</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <StatsCards habits={habits} habitLogs={habitLogs} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardHeader className="pb-2">
                    <h3 className="text-sm font-medium">Completion History</h3>
                    <p className="text-xs text-muted-foreground">
                      Your habit completion patterns over time
                    </p>
                  </CardHeader>
                  <CardContent>
                    <StreakHeatmap habits={habits} habitLogs={habitLogs} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <h3 className="text-sm font-medium">Today&apos;s Habits</h3>
                    <p className="text-xs text-muted-foreground">
                      Habits to complete today
                    </p>
                  </CardHeader>
                  <CardContent className="h-[400px] overflow-auto">
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
            </TabsContent>

            <TabsContent value="habits">
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="text-sm font-medium">All Habits</h3>
                  <p className="text-xs text-muted-foreground">
                    Manage all your habits
                  </p>
                </CardHeader>
                <CardContent className="h-[600px] overflow-auto">
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
                <CardHeader className="pb-2">
                  <h3 className="text-sm font-medium">Habit Calendar</h3>
                  <p className="text-xs text-muted-foreground">
                    View your habit completion history
                  </p>
                </CardHeader>
                <CardContent>
                  <HabitCalendar habits={habits} habitLogs={habitLogs} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {error && (
          <div className="mx-4 mt-3 rounded border border-destructive bg-destructive/10 p-2 text-sm text-destructive">
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
