"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { fetchHabits } from "~/lib/api";
import type { Habit } from "~/types";

export function HabitsList() {
  const { userId } = useAuth();
  const { data: habits = [] } = useQuery<Habit[]>({
    queryKey: ["habits", userId],
    queryFn: () => fetchHabits(userId!),
    enabled: !!userId,
  });

  if (!habits.length) {
    return <div>No habits found. Create your first habit to get started!</div>;
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => (
        <div
          key={habit.id}
          className="flex items-center justify-between rounded-lg bg-white p-4 shadow"
        >
          <div>
            <h3 className="font-medium">{habit.name}</h3>
            <p className="text-sm text-gray-500">{habit.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Streak: {habit.streak}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
