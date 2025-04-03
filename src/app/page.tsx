import { Suspense } from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { DashboardPage } from "~/components/dashboard-page";
import { LandingPage } from "~/components/landing-page";
import { AuthWrapper } from "~/components/auth-wrapper";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import RootLoading from "./loading";

export default function Home() {
  return (
    <AuthWrapper>
      <SignedIn>
        <Suspense fallback={<RootLoading />}>
          <DashboardPage />
        </Suspense>
      </SignedIn>
      <SignedOut>
        <Suspense fallback={<LoadingSpinner className="min-h-screen" />}>
          <LandingPage />
        </Suspense>
      </SignedOut>
    </AuthWrapper>
  );
}
