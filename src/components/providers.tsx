"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "~/components/theme-provider";
import { LoadingProvider } from "~/contexts/loading-context";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            staleTime: Infinity,
            gcTime: Infinity,
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LoadingProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}
