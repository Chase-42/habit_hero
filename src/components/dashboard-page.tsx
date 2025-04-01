import { Suspense } from "react";
import { Header } from "~/components/header";
import { DashboardContent } from "~/components/dashboard-content";
import RootLoading from "~/app/loading";

export function DashboardPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <Suspense fallback={<RootLoading />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
