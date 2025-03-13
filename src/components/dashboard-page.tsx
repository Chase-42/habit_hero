"use client";

import { useState } from "react";
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
import { mockHabits } from "~/lib/mock-data";
import { ThemeToggle } from "~/components/theme-toggle";
import type { Habit } from "~/types";

type NewHabit = Omit<Habit, "id" | "createdAt" | "completedDates" | "streak">;

export function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>(() =>
    mockHabits.map((habit) => ({
      ...habit,
      completedDates: habit.completedDates ?? [],
      days: habit.days ?? undefined,
    })),
  );
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);

  const addHabit = (newHabit: NewHabit) => {
    const habit: Habit = {
      ...newHabit,
      id: Date.now().toString(),
      createdAt: new Date(),
      completedDates: [],
      streak: 0,
    };
    setHabits((currentHabits) => [...currentHabits, habit]);
  };

  const completeHabit = (id: string) => {
    const today = new Date().toISOString().split("T")[0];
    if (!today) return;

    setHabits((currentHabits) =>
      currentHabits.map((habit) => {
        if (habit.id === id) {
          const completedDates = habit.completedDates;

          // Check if already completed today
          if (completedDates.includes(today)) {
            return {
              ...habit,
              completedDates: completedDates.filter((date) => date !== today),
              streak: habit.streak > 0 ? habit.streak - 1 : 0,
            };
          }

          return {
            ...habit,
            completedDates: [...completedDates, today],
            streak: habit.streak + 1,
          };
        }
        return habit;
      }),
    );
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
            <Button onClick={() => setIsAddHabitOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Habit
            </Button>
          </div>

          <StatsCards habits={habits} />

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
                    <WeeklyProgress habits={habits} />
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
                  <CardDescription>Habits to complete today</CardDescription>
                </CardHeader>
                <CardContent>
                  <HabitList
                    habits={habits.filter((habit) => {
                      const today = new Date().getDay();
                      return (
                        habit.frequency === "daily" ||
                        (habit.frequency === "weekdays" &&
                          today > 0 &&
                          today < 6) ||
                        (habit.frequency === "custom" &&
                          habit.days?.includes(today))
                      );
                    })}
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
                  <HabitCalendar habits={habits} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <AddHabitModal
        open={isAddHabitOpen}
        onOpenChange={setIsAddHabitOpen}
        onAddHabit={addHabit}
      />
    </div>
  );
}
