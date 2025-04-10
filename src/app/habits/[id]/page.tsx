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
import { fetchHabitLogs } from "~/lib/api";
import { getHabitById } from "~/server/queries";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import type { HabitLog } from "~/types";

export default async function HabitDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const habit = await getHabitById(params.id);
  if (!habit || habit.userId !== userId) {
    notFound();
  }

  // Get habit logs for the last 30 days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const endDate = new Date();

  const habitLogs = await fetchHabitLogs(habit.id, startDate, endDate, userId);
  const chartData = habitLogs
    .filter((log) => log.habitId === habit.id)
    .map((log) => ({
      date: format(new Date(log.completedAt), "MMM d"),
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
