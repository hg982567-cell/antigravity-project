import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CurrencyProvider } from "@/components/providers/CurrencyContext";
import { DemoProvider } from "@/components/providers/DemoContext";
import { SystemProvider } from "@/components/providers/SystemContext";

export const metadata: Metadata = {
  title: "DropAI — Autonomous Dropshipping & Ecommerce Intelligence",
  description: "Enterprise-grade AI platform for product research, verified supplier intelligence, store automation, and predictive marketing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <ThemeProvider>
          <CurrencyProvider>
            <DemoProvider>
              <SystemProvider>
                {children}
              </SystemProvider>
            </DemoProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
