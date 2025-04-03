import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "~/components/theme-provider";
import { LoadingProvider } from "~/contexts/loading-context";
import { QueryProvider } from "~/components/query-provider";
import "~/styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </head>
        <body className="min-h-screen bg-background antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <LoadingProvider>
              <QueryProvider>
                <div className="px-3">{children}</div>
              </QueryProvider>
            </LoadingProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
