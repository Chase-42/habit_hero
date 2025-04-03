import { Skeleton } from "~/components/ui/loading/skeleton";

export default function SettingsLoading() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
      </div>

      {/* Settings sections skeleton */}
      <div className="space-y-8">
        {/* Profile section */}
        <div className="rounded-lg bg-card p-6 shadow">
          <Skeleton className="mb-4 h-6 w-32" />
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preferences section */}
        <div className="rounded-lg bg-card p-6 shadow">
          <Skeleton className="mb-4 h-6 w-32" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone section */}
        <div className="rounded-lg bg-card p-6 shadow">
          <Skeleton className="mb-4 h-6 w-32" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
      </div>
    </div>
  );
}
