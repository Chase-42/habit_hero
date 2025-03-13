"use client";

import { Award, Calendar, CheckCircle, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useEffect, useState } from "react";
import type { Habit } from "~/types";

interface StatsCardsProps {
  habits: Habit[];
}

interface Stats {
  totalHabits: number;
  completedToday: number;
  longestStreak: number;
  weeklyCompletionRate: number;
  todayTotal: number;
}

const initialStats: Stats = {
  totalHabits: 0,
  completedToday: 0,
  longestStreak: 0,
  weeklyCompletionRate: 0,
  todayTotal: 0,
};

type HabitFrequency = "daily" | "weekdays" | "custom";

export function StatsCards({ habits }: StatsCardsProps) {
  const [stats, setStats] = useState<Stats>(initialStats);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    // Set the current date once on mount
    setCurrentDate(new Date());
  }, []);

  useEffect(() => {
    if (!currentDate) return;

    // Calculate all stats here to avoid hydration mismatch
    const calculateStats = () => {
      // Calculate total habits
      const totalHabits = habits.length;

      // Calculate completed today
      const today = currentDate.toISOString().split("T")[0];
      if (!today) {
        setStats(initialStats);
        return;
      }

      const completedToday = habits.filter((habit) =>
        habit.completedDates.includes(today),
      ).length;

      // Calculate current streak (longest active streak)
      const longestStreak = habits.reduce(
        (max, habit) => Math.max(max, habit.streak),
        0,
      );

      // Calculate completion rate for the week
      const now = currentDate;
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      let totalPossible = 0;
      let totalCompleted = 0;

      habits.forEach((habit) => {
        // Count how many days in the past week this habit should have been done
        for (
          let d = new Date(oneWeekAgo);
          d <= now;
          d.setDate(d.getDate() + 1)
        ) {
          const day = d.getDay();
          const dateString = d.toISOString().split("T")[0];
          if (!dateString) continue;

          // Check if habit should be done on this day
          if (
            habit.frequency === "daily" ||
            (habit.frequency === "weekdays" && day > 0 && day < 6) ||
            (habit.frequency === "custom" &&
              Array.isArray(habit.days) &&
              habit.days.includes(day))
          ) {
            totalPossible++;

            // Check if habit was completed on this day
            if (
              Array.isArray(habit.completedDates) &&
              habit.completedDates.includes(dateString)
            ) {
              totalCompleted++;
            }
          }
        }
      });

      const weeklyCompletionRate =
        totalPossible > 0
          ? Math.round((totalCompleted / totalPossible) * 100)
          : 0;

      // Calculate today's total habits
      const currentDay = currentDate.getDay();
      const todayTotal = habits.filter((habit) => {
        return (
          habit.frequency === "daily" ||
          (habit.frequency === "weekdays" &&
            currentDay > 0 &&
            currentDay < 6) ||
          (habit.frequency === "custom" &&
            Array.isArray(habit.days) &&
            habit.days.includes(currentDay))
        );
      }).length;

      setStats({
        totalHabits,
        completedToday,
        longestStreak,
        weeklyCompletionRate,
        todayTotal,
      });
    };

    calculateStats();
  }, [habits, currentDate]);

  if (!currentDate) {
    return null;
  }

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalHabits}</div>
          <p className="text-xs text-muted-foreground">Habits being tracked</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedToday}</div>
          <p className="text-xs text-muted-foreground">
            Out of {stats.todayTotal} for today
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.longestStreak} days</div>
          <p className="text-xs text-muted-foreground">
            Keep the momentum going!
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Weekly Completion
          </CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.weeklyCompletionRate}%
          </div>
          <p className="text-xs text-muted-foreground">For the past 7 days</p>
        </CardContent>
      </Card>
    </div>
  );
}
