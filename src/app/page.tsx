import { Suspense } from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { DashboardPage } from "~/components/dashboard-page";
import { LandingPage } from "~/components/landing-page";
import { AuthWrapper } from "~/components/auth-wrapper";

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthWrapper>
      <SignedIn>
        <Suspense fallback={<LoadingSpinner />}>
          <DashboardPage />
        </Suspense>
      </SignedIn>
      <SignedOut>
        <Suspense fallback={<LoadingSpinner />}>
          <LandingPage />
        </Suspense>
      </SignedOut>
    </AuthWrapper>
  );
}
