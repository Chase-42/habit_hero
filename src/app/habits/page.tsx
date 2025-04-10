import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { HabitsList } from "~/components/habits/habits-list";
import { fetchHabits } from "~/lib/api";
import { auth } from "@clerk/nextjs/server";

export default async function HabitsPage() {
  const session = await auth();
  if (!session.userId) throw new Error("Not authenticated");

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["habits", session.userId],
    queryFn: () => fetchHabits(session.userId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HabitsList />
    </HydrationBoundary>
  );
}
