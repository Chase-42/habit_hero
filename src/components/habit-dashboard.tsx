"use client";

import { useState, useEffect, useCallback } from "react";
import { useHabits } from "~/hooks/use-habits";
import type { Habit, HabitLog } from "~/types";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { AddHabitModal } from "~/components/add-habit-modal";
import { HabitList } from "~/components/habit-list";
import { HabitCategoryChart } from "~/components/habit-category-chart";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "sonner";

interface HabitDashboardProps {
  userId: string;
}

export function HabitDashboard({ userId }: HabitDashboardProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "archived">(
    "active"
  );

  const { isLoading, error, fetchFilteredHabits, logHabit, fetchHabitLogs } =
    useHabits(userId);

  const loadHabits = useCallback(async () => {
    try {
      const filters = {
        userId,
        isActive:
          activeTab === "active"
            ? true
            : activeTab === "archived"
              ? false
              : undefined,
      };
      const fetchedHabits = await fetchFilteredHabits(filters);
      setHabits(fetchedHabits);

      // Only fetch logs for active habits
      const activeHabits = fetchedHabits.filter((h) => h.isActive);
      if (activeHabits.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const logs = await Promise.all(
          activeHabits.map((habit) => fetchHabitLogs(habit.id, today, tomorrow))
        );
        setHabitLogs(logs.flat());
      } else {
        setHabitLogs([]);
      }
    } catch (err) {
      console.error("Error loading habits:", err);
      toast.error("Failed to load habits. Please try again.");
    }
  }, [activeTab, fetchFilteredHabits, userId, fetchHabitLogs]);

  useEffect(() => {
    void loadHabits();
  }, [loadHabits]);

  const handleAddHabit = async (
    habit: Omit<
      Habit,
      "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
    >
  ) => {
    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(habit),
      });

      if (!response.ok) {
        throw new Error("Failed to create habit");
      }

      const newHabit = (await response.json()) as Habit;

      // Update local state instead of reloading
      setHabits((prevHabits) => [...prevHabits, newHabit]);
      setIsAddModalOpen(false);
      toast.success("Habit created successfully!");
    } catch (err) {
      console.error("Error creating habit:", err);
      toast.error("Failed to create habit. Please try again.");
      throw err;
    }
  };

  const handleCompleteHabit = async (habit: Habit) => {
    try {
      const logData: Omit<HabitLog, "id"> = {
        habitId: habit.id,
        userId: habit.userId,
        completedAt: new Date(),
        value: null,
        notes: null,
        details: null,
        difficulty: null,
        feeling: null,
        hasPhoto: false,
        photoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newLog = await logHabit(logData);

      // Update local state
      setHabitLogs((prevLogs) => [...prevLogs, newLog]);

      // Update the habit in the list to reflect the new completion
      setHabits((prevHabits) =>
        prevHabits.map((h) =>
          h.id === habit.id
            ? {
                ...h,
                lastCompleted: newLog.completedAt,
                streak: h.streak + 1,
                longestStreak: Math.max(h.longestStreak, h.streak + 1),
              }
            : h
        )
      );

      toast.success(`${habit.name} completed!`);
    } catch (err) {
      console.error("Error completing habit:", err);
      toast.error("Failed to complete habit. Please try again.");
    }
  };

  const handleDeleteHabit = async (habit: Habit) => {
    try {
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete habit");
      }

      // Update local state
      setHabits((prevHabits) => prevHabits.filter((h) => h.id !== habit.id));
      setHabitLogs((prevLogs) =>
        prevLogs.filter((log) => log.habitId !== habit.id)
      );
      toast.success(`${habit.name} deleted successfully`);
    } catch (err) {
      console.error("Error deleting habit:", err);
      toast.error("Failed to delete habit. Please try again.");
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-destructive">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Habits</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>Add Habit</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <HabitCategoryChart habits={habits} />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Habits</CardTitle>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as typeof activeTab)}
          >
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <HabitList
              habits={habits}
              habitLogs={habitLogs}
              onComplete={handleCompleteHabit}
              onDelete={handleDeleteHabit}
              userId={userId}
            />
          )}
        </CardContent>
      </Card>

      <AddHabitModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        userId={userId}
        onAddHabit={handleAddHabit}
        isLoading={isLoading}
      />
    </div>
  );
}
