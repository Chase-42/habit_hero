"use client";

import { Activity, Calendar, Target, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useEffect, useState } from "react";
import type { Habit, HabitLog } from "~/types";

interface StatsCardsProps {
  habits: Habit[];
  habitLogs: HabitLog[];
}

interface Stats {
  totalHabits: number;
  completedToday: number;
  currentStreak: number;
  completionRate: number;
}

export function StatsCards({ habits, habitLogs }: StatsCardsProps) {
  const [stats, setStats] = useState<Stats>({
    totalHabits: 0,
    completedToday: 0,
    currentStreak: 0,
    completionRate: 0,
  });

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeHabits = habits.filter((h) => h.isActive && !h.isArchived);
    const completedToday = activeHabits.filter(
      (h) =>
        h.lastCompleted &&
        new Date(h.lastCompleted).setHours(0, 0, 0, 0) === today.getTime()
    ).length;

    // Calculate completion rate for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });

    const totalPossibleCompletions = activeHabits.length * 7;
    const actualCompletions = habitLogs.filter((log) =>
      last7Days.includes(new Date(log.completedAt).setHours(0, 0, 0, 0))
    ).length;

    const completionRate =
      totalPossibleCompletions > 0
        ? (actualCompletions / totalPossibleCompletions) * 100
        : 0;

    // Find the longest current streak
    const currentStreak = Math.max(
      0,
      ...activeHabits.map((h) => h.streak || 0)
    );

    setStats({
      totalHabits: activeHabits.length,
      completedToday,
      currentStreak,
      completionRate,
    });
  }, [habits, habitLogs]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalHabits}</div>
          <p className="text-xs text-muted-foreground">Active habits</p>
        </CardContent>
      </Card>

      <Card className="transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.completedToday} / {stats.totalHabits}
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{
                width: `${(stats.completedToday / stats.totalHabits) * 100}%`,
              }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {((stats.completedToday / stats.totalHabits) * 100).toFixed(0)}%
            complete
          </p>
        </CardContent>
      </Card>

      <Card className="transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.currentStreak}</div>
          <p className="text-xs text-muted-foreground">
            {stats.currentStreak === 1 ? "day" : "days"} in a row
          </p>
        </CardContent>
      </Card>

      <Card className="transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.completionRate.toFixed(0)}%
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Last 7 days completion rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
