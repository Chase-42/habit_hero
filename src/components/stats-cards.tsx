"use client";

import { Activity, Calendar, Target, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useEffect, useState } from "react";
import type { Habit, HabitLog } from "~/types";

function calculateCurrentStreak(
  habits: Habit[],
  habitLogs: HabitLog[]
): number {
  // Simple implementation - can be enhanced based on your streak calculation logic
  return 3; // Placeholder for now
}

function calculateWeeklyProgress(
  habits: Habit[],
  habitLogs: HabitLog[]
): number {
  // Simple implementation - can be enhanced based on your progress calculation logic
  return 23; // Placeholder for now
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
    // ... existing filtering logic ...
    return true; // Placeholder
  });

  const completedToday = habitLogs.filter((log) => {
    // ... existing filtering logic ...
    return true; // Placeholder
  });

  const currentStreak = calculateCurrentStreak(habits, habitLogs);
  const weeklyProgress = calculateWeeklyProgress(habits, habitLogs);

  return (
    <>
      <div className="rounded-lg border bg-card p-4 text-card-foreground">
        <h3 className="text-base font-medium">Total Habits</h3>
        <div className="mt-2">
          <div className="text-4xl font-bold">{habits.length}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Active habits
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 text-card-foreground">
        <h3 className="text-base font-medium">Complete Today</h3>
        <div className="mt-2">
          <div className="text-4xl font-bold">
            {completedToday.length} / {todayHabits.length}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {Math.round((completedToday.length / todayHabits.length) * 100) ||
              0}
            % complete
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 text-card-foreground">
        <h3 className="text-base font-medium">Current Streak</h3>
        <div className="mt-2">
          <div className="text-4xl font-bold">{currentStreak}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            days in
            <br />a row
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 text-card-foreground">
        <h3 className="text-base font-medium">Weekly Progress</h3>
        <div className="mt-2">
          <div className="text-4xl font-bold">{weeklyProgress}%</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Last 7<br />
            days completion
            <br />
            rate
          </div>
        </div>
      </div>
    </>
  );
}
