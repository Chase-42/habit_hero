"use client";

import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { mockHabits } from "~/lib/mock-data";
import type { HabitLog } from "~/types/models/log";
import { useHabits } from "~/hooks/use-habits";
import { useEffect, useState } from "react";

export default function HabitPage({ params }: { params: { id: string } }) {
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const { fetchHabitLogs } = useHabits(params.id);

  useEffect(() => {
    const loadHabitLogs = async () => {
      const logs = await fetchHabitLogs(params.id);
      setHabitLogs(logs);
    };
    void loadHabitLogs();
  }, [params.id, fetchHabitLogs]);

  const habit = mockHabits.find((h) => h.id === params.id);

  if (!habit) {
    return <div>Habit not found</div>;
  }

  const chartData = habitLogs
    .filter((log) => log.habitId === habit.id)
    .map((log) => ({
      date: format(log.completedAt as Date, "MMM d"),
      completed: 1,
    }));

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{habit.name}</h1>
        <p className="text-muted-foreground">
          {habit.frequencyType} • {habit.category}
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>Your habit completion over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="font-medium">Goal</div>
                <div className="text-muted-foreground">{habit.goal}</div>
              </div>
              {habit.notes && (
                <div>
                  <div className="font-medium">Notes</div>
                  <div className="text-muted-foreground">{habit.notes}</div>
                </div>
              )}
              {habit.reminder && (
                <div>
                  <div className="font-medium">Reminder</div>
                  <div className="text-muted-foreground">
                    {format(habit.reminder, "PPp")}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Edit Habit
              </Button>
              <Button variant="destructive" className="w-full">
                Delete Habit
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
