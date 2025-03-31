"use client";

import { useAuth } from "@clerk/nextjs";
import { LoadingSpinner } from "~/components/ui/loading-spinner";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  return <>{children}</>;
}
