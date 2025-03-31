"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { LoadingOverlay } from "~/components/ui/loading/loading-overlay";

interface LoadingContextType {
  isLoading: boolean;
  message: string | null;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  wrapPromise: <T>(promise: Promise<T>) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    message: null as string | null,
  });

  const showLoading = useCallback((message?: string) => {
    setLoadingState({ isLoading: true, message: message ?? null });
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingState({ isLoading: false, message: null });
  }, []);

  const wrapPromise = useCallback(
    async <T,>(promise: Promise<T>): Promise<T> => {
      showLoading();
      try {
        return await promise;
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  return (
    <LoadingContext.Provider
      value={{
        isLoading: loadingState.isLoading,
        message: loadingState.message,
        showLoading,
        hideLoading,
        wrapPromise,
      }}
    >
      {children}
      <LoadingOverlay
        isLoading={loadingState.isLoading}
        message={loadingState.message ?? undefined}
      />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
