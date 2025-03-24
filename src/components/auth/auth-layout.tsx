import { type ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Left side - Auth form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">{children}</div>
      </div>

      {/* Right side - Animated background */}
      <div className="relative hidden items-center justify-center overflow-hidden bg-muted md:flex">
        <div className="animate-gradient absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20" />
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="space-y-4 text-center text-white">
            <h1 className="text-4xl font-bold">Habit Hero</h1>
            <p className="text-xl">Transform your life, one habit at a time</p>
          </div>
        </div>
      </div>
    </div>
  );
}
