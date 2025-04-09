"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  type TooltipProps,
} from "recharts";
import type { HabitCategory } from "~/types";
import type { CategoryData, HabitCategoryChartProps } from "~/types/chart";
import { Card } from "~/components/ui/card";

const categoryColors: Record<HabitCategory, string> = {
  fitness: "#ef4444",
  nutrition: "#22c55e",
  mindfulness: "#3b82f6",
  productivity: "#a855f7",
  other: "#6b7280",
};

const categoryLabels: Record<HabitCategory, string> = {
  fitness: "Fitness",
  nutrition: "Nutrition",
  mindfulness: "Mindfulness",
  productivity: "Productivity",
  other: "Other",
};

export function HabitCategoryChart({ habits }: HabitCategoryChartProps) {
  const data: CategoryData[] = Object.entries(
    habits.reduce(
      (acc, habit) => {
        const category = habit.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<HabitCategory, number>
    )
  ).map(([category, count]) => ({
    name: category as HabitCategory,
    value: count,
    label: categoryLabels[category as HabitCategory],
    color: categoryColors[category as HabitCategory],
  }));

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload?.[0]?.payload) return null;
    const data = payload[0].payload as CategoryData;
    return (
      <Card className="p-3">
        <p className="text-sm font-medium">{data.label}</p>
        <p className="text-xs text-muted-foreground">
          {data.value} habit{data.value === 1 ? "" : "s"}
        </p>
      </Card>
    );
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="label"
            width={100}
            className="text-xs font-medium"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            className="fill-primary"
            radius={[0, 4, 4, 0]}
            fill="currentColor"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
