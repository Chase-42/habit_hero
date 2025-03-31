import { useState, useCallback } from "react";
import { useLoading } from "~/contexts/loading-context";

interface UseLoadingStateOptions {
  delay?: number;
  message?: string;
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const { showLoading, hideLoading, wrapPromise } = useLoading();
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    showLoading(options.message);
  }, [showLoading, options.message]);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    hideLoading();
  }, [hideLoading]);

  const withLoading = useCallback(
    async <T>(promise: Promise<T>): Promise<T> => {
      startLoading();
      try {
        return await promise;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
    wrapPromise,
  };
}
