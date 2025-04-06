"use client";

import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { LoadingProvider } from "./loading-context";
import { DIProvider } from "./di-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DIProvider>
      <QueryProvider>
        <ThemeProvider>
          <LoadingProvider>{children}</LoadingProvider>
        </ThemeProvider>
      </QueryProvider>
    </DIProvider>
  );
}
