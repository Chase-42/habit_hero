"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import Link from "next/link";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { HabitCalendar } from "~/components/habit-calendar";
import { mockHabits } from "~/lib/mock-data";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { Textarea } from "~/components/ui/textarea";

type HabitColor =
  | "blue"
  | "red"
  | "green"
  | "purple"
  | "yellow"
  | "pink"
  | "indigo"
  | "teal";

interface Habit {
  id: string;
  name: string;
  color: HabitColor;
  frequency: "daily" | "weekdays" | "custom";
  category: string;
  streak: number;
  completedDates?: string[];
  days?: number[] | null;
  goal?: string;
  notes?: string;
  reminder?: string;
  createdAt?: Date;
}

export default function HabitDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    // Find habit by ID from mock data
    const foundHabit = mockHabits.find((h) => h.id === params.id);
    if (foundHabit) {
      setHabit(foundHabit);
      setNotes(foundHabit.notes ?? "");
    } else {
      router.push("/");
    }
  }, [params.id, router]);

  if (!habit) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Calculate completion rate for the past 30 days
  const getMonthlyData = () => {
    const data = [];
    const today = new Date();

    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - i * 7 - 6);
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      let daysInPeriod = 0;
      let daysCompleted = 0;

      for (
        let d = new Date(weekStart);
        d <= weekEnd;
        d.setDate(d.getDate() + 1)
      ) {
        const day = d.getDay();
        const dateString = d.toISOString().split("T")[0];
        if (dateString) {
          // Check if habit should be done on this day
          if (
            habit.frequency === "daily" ||
            (habit.frequency === "weekdays" && day > 0 && day < 6) ||
            (habit.frequency === "custom" && habit.days?.includes(day))
          ) {
            daysInPeriod++;

            // Check if habit was completed on this day
            if (habit.completedDates?.includes(dateString)) {
              daysCompleted++;
            }
          }
        }
      }

      const completionRate =
        daysInPeriod > 0 ? Math.round((daysCompleted / daysInPeriod) * 100) : 0;

      const weekLabel = `Week ${4 - i}`;

      data.unshift({
        name: weekLabel,
        value: completionRate,
      });
    }

    return data;
  };

  const monthlyData = getMonthlyData();

  // Calculate best streak
  const calculateBestStreak = () => {
    if (!habit.completedDates || habit.completedDates.length === 0) return 0;

    // Sort dates
    const sortedDates = [...habit.completedDates].sort();

    let currentStreak = 1;
    let bestStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDateStr = sortedDates[i - 1];
      const currDateStr = sortedDates[i];

      if (prevDateStr && currDateStr) {
        const prevDate = new Date(prevDateStr);
        const currDate = new Date(currDateStr);

        // Check if dates are consecutive
        prevDate.setDate(prevDate.getDate() + 1);

        if (prevDate.toISOString().split("T")[0] === sortedDates[i]) {
          currentStreak++;
          bestStreak = Math.max(bestStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }
    }

    return bestStreak;
  };

  const bestStreak = calculateBestStreak();

  // Calculate completion rate
  const calculateCompletionRate = () => {
    if (!habit.completedDates) return 0;

    const createdAt =
      habit.createdAt ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const today = new Date();
    let daysToComplete = 0;

    for (let d = new Date(createdAt); d <= today; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();

      if (
        habit.frequency === "daily" ||
        (habit.frequency === "weekdays" && day > 0 && day < 6) ||
        (habit.frequency === "custom" && habit.days?.includes(day))
      ) {
        daysToComplete++;
      }
    }

    return daysToComplete > 0
      ? Math.round((habit.completedDates.length / daysToComplete) * 100)
      : 0;
  };

  const completionRate = calculateCompletionRate();

  const colorMap: Record<HabitColor, string> = {
    blue: "#3b82f6",
    red: "#ef4444",
    green: "#10b981",
    purple: "#8b5cf6",
    yellow: "#f59e0b",
    pink: "#ec4899",
    indigo: "#6366f1",
    teal: "#14b8a6",
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center py-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <span className="ml-4 text-lg font-medium">Habit Details</span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button variant="outline" size="icon" className="text-destructive">
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "h-8 w-8 rounded-full",
                  habit.color === "blue" && "bg-blue-500",
                  habit.color === "red" && "bg-red-500",
                  habit.color === "green" && "bg-green-500",
                  habit.color === "purple" && "bg-purple-500",
                  habit.color === "yellow" && "bg-yellow-500",
                  habit.color === "pink" && "bg-pink-500",
                  habit.color === "indigo" && "bg-indigo-500",
                  habit.color === "teal" && "bg-teal-500",
                )}
              />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {habit.name}
                </h1>
                <p className="text-muted-foreground">
                  {habit.frequency === "daily"
                    ? "Daily"
                    : habit.frequency === "weekdays"
                      ? "Weekdays"
                      : "Custom days"}
                  {" • "}
                  {habit.category.charAt(0).toUpperCase() +
                    habit.category.slice(1)}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-base",
                habit.color === "blue" &&
                  "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
                habit.color === "red" &&
                  "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
                habit.color === "green" &&
                  "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                habit.color === "purple" &&
                  "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
                habit.color === "yellow" &&
                  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
                habit.color === "pink" &&
                  "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
                habit.color === "indigo" &&
                  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
                habit.color === "teal" &&
                  "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
              )}
            >
              {habit.streak} day streak
            </Badge>
          </div>

          <Tabs defaultValue="overview" className="mt-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Completion Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{completionRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      Since you started tracking
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Best Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{bestStreak} days</div>
                    <p className="text-xs text-muted-foreground">
                      Your record streak
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Completions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {habit.completedDates?.length ?? 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Times you&apos;ve completed this habit
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Progress</CardTitle>
                  <CardDescription>
                    Your completion rate over the past 4 weeks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `${value}%`} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={colorMap[habit.color]}
                          strokeWidth={2}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {habit.goal && (
                <Card>
                  <CardHeader>
                    <CardTitle>Goal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{habit.goal}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="calendar">
              <Card>
                <CardHeader>
                  <CardTitle>Completion History</CardTitle>
                  <CardDescription>
                    Calendar view of your habit completions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HabitCalendar habits={[habit]} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                  <CardDescription>Add notes about your habit</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about your habit here..."
                    className="min-h-[200px]"
                  />
                  <Button className="mt-4">Save Notes</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
