import { container } from "~/di/container";
import { createContext, useContext, type ReactNode } from "react";

const DIContext = createContext<typeof container | null>(null);

export function useDI() {
  const context = useContext(DIContext);
  if (!context) {
    throw new Error("useDI must be used within a DIProvider");
  }
  return context;
}

interface DIProviderProps {
  children: ReactNode;
}

export function DIProvider({ children }: DIProviderProps) {
  return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}
