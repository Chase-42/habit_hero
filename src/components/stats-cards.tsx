"use client";

import { Activity, Calendar, Target, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useEffect, useState } from "react";
import type { Habit, HabitLog } from "~/types";

function calculateCurrentStreak(
  habits: Habit[],
  habitLogs: HabitLog[]
): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeHabits = habits.filter((h) => h.isActive && !h.isArchived);
  let maxStreak = 0;

  for (const habit of activeHabits) {
    let currentStreak = 0;
    const lastCompleted = habit.lastCompleted
      ? new Date(habit.lastCompleted)
      : null;

    if (lastCompleted) {
      lastCompleted.setHours(0, 0, 0, 0);
      const daysSinceLastCompletion = Math.floor(
        (today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastCompletion === 0) {
        // Habit was completed today
        currentStreak = (habit.streak || 0) + 1;
      } else if (daysSinceLastCompletion === 1) {
        // Habit was completed yesterday
        currentStreak = habit.streak || 0;
      }
    }

    maxStreak = Math.max(maxStreak, currentStreak);
  }

  return maxStreak;
}

function calculateWeeklyProgress(
  habits: Habit[],
  habitLogs: HabitLog[]
): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 6); // Last 7 days including today

  const activeHabits = habits.filter((h) => h.isActive && !h.isArchived);
  const totalPossibleCompletions = activeHabits.length * 7;

  if (totalPossibleCompletions === 0) return 0;

  const weeklyLogs = habitLogs.filter((log) => {
    const logDate = new Date(log.completedAt);
    logDate.setHours(0, 0, 0, 0);
    return logDate >= weekStart && logDate <= today;
  });

  return Math.round((weeklyLogs.length / totalPossibleCompletions) * 100);
}

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

  const todayHabits = habits.filter((habit) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return habit.isActive && !habit.isArchived;
  });

  const completedToday = habitLogs.filter((log) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const logDate = new Date(log.completedAt);
    logDate.setHours(0, 0, 0, 0);
    return logDate.getTime() === today.getTime();
  });

  const currentStreak = calculateCurrentStreak(habits, habitLogs);
  const weeklyProgress = calculateWeeklyProgress(habits, habitLogs);

  return (
    <>
      <Card
        key={0}
        className="min-h-[120px] w-[289px] overflow-hidden rounded-sm"
      >
        <CardContent className="flex h-full flex-row items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Habits</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{habits.length}</span>
              <span className="text-sm text-muted-foreground">active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        key={1}
        className="min-h-[120px] w-[289px] overflow-hidden rounded-sm"
      >
        <CardContent className="flex h-full flex-row items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Today&apos;s Progress
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {Math.round(
                  (completedToday.length / todayHabits.length) * 100
                ) || 0}
                %
              </span>
              <span className="text-sm text-muted-foreground">
                {completedToday.length}/{todayHabits.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        key={2}
        className="min-h-[120px] w-[289px] overflow-hidden rounded-sm"
      >
        <CardContent className="flex h-full flex-row items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{currentStreak}</span>
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        key={3}
        className="min-h-[120px] w-[289px] overflow-hidden rounded-sm"
      >
        <CardContent className="flex h-full flex-row items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Weekly Progress</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{weeklyProgress}%</span>
              <span className="text-sm text-muted-foreground">completed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
