"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "~/components/ui/chart";

interface WeeklyProgressProps {
  habits: any[];
}

export function WeeklyProgress({ habits }: WeeklyProgressProps) {
  // Get data for the past 7 days
  const getDailyData = () => {
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

      // Count habits that should be done on this day
      const dayOfWeek = date.getDay();
      const habitsForDay = habits.filter(
        (habit) =>
          habit.frequency === "daily" ||
          (habit.frequency === "weekdays" && dayOfWeek > 0 && dayOfWeek < 6) ||
          (habit.frequency === "custom" && habit.days?.includes(dayOfWeek)),
      );

      // Count completed habits for this day
      const completedHabits = habitsForDay.filter((habit) =>
        habit.completedDates?.includes(dateString),
      ).length;

      // Calculate completion percentage
      const completionRate =
        habitsForDay.length > 0
          ? Math.round((completedHabits / habitsForDay.length) * 100)
          : 0;

      data.push({
        name: dayName,
        value: completionRate,
      });
    }

    return data;
  };

  const data = getDailyData();

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: number) => `${value}%`} />
          <Bar dataKey="value" fill="hsl(var(--chart-1))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
