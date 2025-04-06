"use client";

import { Calendar } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { HabitCalendar } from "~/components/habit-calendar";
import { HabitList } from "~/components/habit-list";
import { StreakHeatmap } from "~/components/streak-heatmap";
import { StatsCards } from "~/components/stats-cards";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
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
import { useDashboard } from "../hooks/use-dashboard";
import type { Habit } from "~/types";

export function DashboardContent() {
  const { user } = useUser();
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    habits,
    habitLogs,
    isLoading,
    error,
    toggleHabitCompletion,
    deleteHabit,
    createHabit,
  } = useDashboard();

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
          </Tabs>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-destructive">Error</h1>
        <p className="text-muted-foreground">{error.message}</p>
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
            <Button
              onClick={() => setIsAddModalOpen(true)}
              variant="default"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Habit
            </Button>
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
                        habits={habits}
                        habitLogs={habitLogs}
                        onComplete={toggleHabitCompletion}
                        onDelete={async (habit) => {
                          setHabitToDelete(habit);
                          return Promise.resolve();
                        }}
                        userId={user?.id ?? ""}
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
                      onComplete={toggleHabitCompletion}
                      onDelete={async (habit) => {
                        setHabitToDelete(habit);
                        return Promise.resolve();
                      }}
                      userId={user?.id ?? ""}
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
        onAddHabit={createHabit}
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
              onClick={() => {
                if (habitToDelete) {
                  void deleteHabit(habitToDelete.id);
                  setHabitToDelete(null);
                }
              }}
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
