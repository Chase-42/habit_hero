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
import type { Habit, HabitCategory } from "~/types";

// Update the Category type to match HabitCategory
type Category = HabitCategory;

interface CategoryData {
  name: Category;
  value: number;
}

interface HabitCategoryChartProps {
  habits: Habit[];
}

export function HabitCategoryChart({ habits }: HabitCategoryChartProps) {
  // Count habits by category
  const getCategoryData = (): CategoryData[] => {
    const categories: Category[] = [
      "fitness",
      "nutrition",
      "mindfulness",
      "productivity",
      "other",
    ];
    const categoryCounts = categories.map((category) => {
      const count = habits.filter(
        (habit) => habit.category === category
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
  const categoryColors: Record<Category, string> = {
    fitness: "#10b981",
    nutrition: "#8b5cf6",
    mindfulness: "#3b82f6",
    productivity: "#f59e0b",
    other: "#6b7280",
  };

  return (
    <div className="h-[300px] w-full">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="value"
              fill={data[0] ? categoryColors[data[0].name] : "#6b7280"}
            />
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
