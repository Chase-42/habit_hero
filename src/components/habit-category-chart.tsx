"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "~/components/ui/chart";
import type { Habit } from "~/types";

interface HabitCategoryChartProps {
  habits: Habit[];
}

export function HabitCategoryChart({ habits }: HabitCategoryChartProps) {
  // Count habits by category
  const getCategoryData = () => {
    const categories = [
      "Health",
      "Mindfulness",
      "Learning",
      "Productivity",
      "Other",
    ];
    const categoryCounts = categories.map((category) => {
      const count = habits.filter(
        (habit) => habit.category === category,
      ).length;
      return {
        name: category,
        value: count,
      };
    });

    // Filter out categories with 0 habits
    return categoryCounts.filter((category) => category.value > 0);
  };

  const data = getCategoryData();

  // Define colors for each category
  const categoryColors: Record<string, string> = {
    Health: "#10b981",
    Mindfulness: "#8b5cf6",
    Learning: "#3b82f6",
    Productivity: "#f59e0b",
    Other: "#6b7280",
  };

  // Get colors array in the same order as data
  const colors = data.map((item) => categoryColors[item.name] ?? "#6b7280");

  return (
    <div className="h-[300px] w-full">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="hsl(var(--chart-1))" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">No habits to display</p>
        </div>
      )}
    </div>
  );
}
