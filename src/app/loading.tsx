import { Skeleton } from "~/components/ui/loading/skeleton";

export default function RootLoading() {
  return (
    <div className="flex h-screen flex-col">
      {/* Header skeleton */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-14 items-center justify-between px-3">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-6 w-24" />
            <div className="hidden items-center gap-1.5 sm:flex">
              <Skeleton className="h-3.5 w-3.5" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="border-b bg-background">
          <div className="px-3 py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Skeleton className="h-7 w-32" />
                <Skeleton className="mt-1 h-4 w-48" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3">
          {/* Tabs skeleton */}
          <div className="px-3">
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-9 flex-1" />
              ))}
            </div>
          </div>

          {/* Overview content skeleton */}
          <div className="space-y-3">
            {/* Stats cards skeleton */}
            <div className="grid grid-cols-2 gap-3 px-3 sm:grid-cols-2 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-sm border bg-card p-3">
                  <Skeleton className="mb-2 h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>

            {/* Charts and list skeleton */}
            <div className="grid grid-cols-1 gap-3 px-3 md:grid-cols-2">
              <div className="rounded-sm border bg-card">
                <div className="px-3 pb-2 pt-3">
                  <Skeleton className="mb-1 h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="px-3 pb-3">
                  <Skeleton className="h-[300px] w-full" />
                </div>
              </div>

              <div className="rounded-sm border bg-card">
                <div className="px-3 pb-2 pt-3">
                  <Skeleton className="mb-1 h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="space-y-3 px-3 pb-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
