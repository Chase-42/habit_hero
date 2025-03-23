"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { Card } from "~/components/ui/card";
import type { Habit, HabitCategory } from "~/types";

// Update the Category type to match HabitCategory
type Category = HabitCategory;

interface CategoryData {
  name: Category;
  value: number;
  label: string;
  color: string;
}

interface HabitCategoryChartProps {
  habits: Habit[];
}

const categoryConfig: Record<Category, { label: string; color: string }> = {
  fitness: { label: "Fitness", color: "hsl(142.1 76.2% 36.3%)" },
  nutrition: { label: "Nutrition", color: "hsl(262.1 83.3% 57.8%)" },
  mindfulness: { label: "Mindfulness", color: "hsl(221.2 83.2% 53.3%)" },
  productivity: { label: "Productivity", color: "hsl(48 96.5% 53.3%)" },
  other: { label: "Other", color: "hsl(215.4 16.3% 46.9%)" },
};

export function HabitCategoryChart({ habits }: HabitCategoryChartProps) {
  // Count habits by category
  const getCategoryData = (): CategoryData[] => {
    const categories = Object.keys(categoryConfig) as Category[];
    const categoryCounts = categories.map((category) => ({
      name: category,
      value: habits.filter((habit) => habit.category === category).length,
      label: categoryConfig[category].label,
      color: categoryConfig[category].color,
    }));

    // Filter out categories with 0 habits and sort by count
    return categoryCounts
      .filter((category) => category.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  const data = getCategoryData();

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload as CategoryData;
      return (
        <Card className="p-3">
          <p className="text-sm font-medium">{data.label}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} habit{data.value !== 1 ? "s" : ""}
          </p>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 16, bottom: 0, left: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              className="text-xs font-medium"
            />
            <YAxis
              type="category"
              dataKey="label"
              axisLine={false}
              tickLine={false}
              className="text-xs font-medium"
              width={80}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "transparent" }}
            />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              className="fill-primary"
              fill="currentColor"
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
