"use client";
import { createContext, useContext, useState } from "react";
import { LoadingOverlay } from "~/components/ui/loading/loading-overlay";

interface LoadingContextType {
  isLoading: boolean;
  message: string | null;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  message: null,
  showLoading: () => {
    throw new Error("showLoading must be used within a LoadingProvider");
  },
  hideLoading: () => {
    throw new Error("hideLoading must be used within a LoadingProvider");
  },
});

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const showLoading = (newMessage?: string) => {
    setIsLoading(true);
    setMessage(newMessage ?? null);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setMessage(null);
  };

  return (
    <LoadingContext.Provider
      value={{ isLoading, message, showLoading, hideLoading }}
    >
      {children}
      <LoadingOverlay isLoading={isLoading} message={message ?? undefined} />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}
