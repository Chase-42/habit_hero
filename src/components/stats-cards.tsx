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
    const calculateStats = () => {
      const today = new Date().toISOString().split("T")[0];
      if (!today) return;

      // Count active habits
      const activeHabits = habits.filter(
        (habit) => habit.isActive && !habit.isArchived,
      );

      // Count habits completed today
      const completedToday = activeHabits.filter((habit) =>
        habitLogs.some(
          (log) =>
            log.habitId === habit.id &&
            log.completedAt.toISOString().split("T")[0] === today,
        ),
      ).length;

      // Calculate completion rate for the past week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split("T")[0];
      if (!weekAgoStr) return;

      const recentLogs = habitLogs.filter((log) => {
        const logDate = log.completedAt.toISOString().split("T")[0];
        return logDate && logDate >= weekAgoStr;
      });

      const completionRate =
        activeHabits.length > 0
          ? Math.round((recentLogs.length / (activeHabits.length * 7)) * 100)
          : 0;

      // Get the highest streak from habits
      const currentStreak = Math.max(
        0,
        ...activeHabits.map((habit) => habit.streak),
      );

      setStats({
        totalHabits: activeHabits.length,
        completedToday,
        currentStreak,
        completionRate,
      });
    };

    calculateStats();
  }, [habits, habitLogs]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalHabits}</div>
          <p className="text-xs text-muted-foreground">Active habits</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedToday}</div>
          <p className="text-xs text-muted-foreground">
            Out of {stats.totalHabits} habits
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.currentStreak}</div>
          <p className="text-xs text-muted-foreground">Days in a row</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completionRate}%</div>
          <p className="text-xs text-muted-foreground">Over the past week</p>
        </CardContent>
      </Card>
    </div>
  );
}
