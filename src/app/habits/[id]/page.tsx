import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { Habit } from "~/entities/models/habit";
import type { HabitLog } from "~/entities/models/habit-log";
import { container } from "~/infrastructure/container";
import type { HabitController } from "~/interface-adapters/controllers/habit.controller";
import type { HabitLogController } from "~/interface-adapters/controllers/habit-log.controller";
import { HabitChart } from "~/components/habit-chart";

export default async function HabitPage({
  params,
}: {
  params: { id: string };
}) {
  const habitController = container.resolve<HabitController>("HabitController");
  const habitLogController =
    container.resolve<HabitLogController>("HabitLogController");

  const habitResult = await habitController.getHabit(params.id);

  if (!habitResult.ok) {
    return <div>Habit not found</div>;
  }

  const habit = habitResult.value;

  // Get logs for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const logsResponse = await fetch(
    `/api/habits/logs?habitId=${habit.id}&userId=${habit.userId}&startDate=${thirtyDaysAgo.toISOString()}&endDate=${new Date().toISOString()}`
  );

  if (!logsResponse.ok) {
    return <div>Failed to load habit logs</div>;
  }

  const habitLogs = (await logsResponse.json()) as HabitLog[];

  const chartData = habitLogs.map((log) => ({
    date: format(new Date(log.completedAt), "MMM d"),
    completed: 1,
  }));

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{habit.title}</CardTitle>
          <CardDescription>{habit.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Category</h3>
              <p>{habit.category}</p>
            </div>
            <div>
              <h3 className="font-semibold">Frequency</h3>
              <p>
                {habit.frequencyType === "daily"
                  ? "Daily"
                  : habit.frequencyType === "weekly"
                    ? "Weekly"
                    : "Monthly"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Current Streak</h3>
              <p>{habit.streak} days</p>
            </div>
            <div>
              <h3 className="font-semibold">Longest Streak</h3>
              <p>{habit.longestStreak} days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Completion History</CardTitle>
        </CardHeader>
        <CardContent>
          <HabitChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}
