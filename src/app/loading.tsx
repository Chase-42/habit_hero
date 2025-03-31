import { Skeleton } from "~/components/ui/loading/skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="container mx-auto p-6">
        <div className="space-y-8">
          {/* Hero section */}
          <div className="space-y-4 text-center">
            <Skeleton className="mx-auto h-12 w-3/4" />
            <Skeleton className="mx-auto h-6 w-1/2" />
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg bg-card p-6 shadow">
                <Skeleton className="mb-4 h-8 w-24" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>

          {/* CTA section */}
          <div className="space-y-4 text-center">
            <Skeleton className="mx-auto h-10 w-48" />
            <Skeleton className="mx-auto h-4 w-1/3" />
          </div>
        </div>
      </main>

      {/* Footer skeleton */}
      <footer className="mt-12 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-4 w-24" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
