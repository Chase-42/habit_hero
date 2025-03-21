import type React from "react";
import { ThemeProvider } from "~/components/theme-provider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>HabitHero - Track Your Habits</title>
        <meta
          name="description"
          content="A modern habit tracking application"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const storedTheme = localStorage.getItem('habit-hero-theme');
            const theme = storedTheme || (prefersDark ? 'dark' : 'light');
            document.documentElement.classList.add(theme);
          })()
        `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
