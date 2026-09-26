import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CurrencyProvider } from "@/components/providers/CurrencyContext";
import { DemoProvider } from "@/components/providers/DemoContext";
import { SystemProvider } from "@/components/providers/SystemContext";
import { NotificationProvider } from "@/components/providers/NotificationContext";

export const metadata: Metadata = {
  title: {
    default: "RAVAN SHIPPING — Autonomous Ecommerce, Dropshipping & Logistics Intelligence",
    template: "%s | RAVAN SHIPPING",
  },
  description: "Enterprise-grade AI platform for product research, verified supplier intelligence, store automation, global logistics, and predictive marketing.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "RAVAN SHIPPING — Autonomous Ecommerce, Dropshipping & Logistics Intelligence",
    description: "Enterprise-grade AI platform for product research, verified supplier intelligence, store automation, global logistics, and predictive marketing.",
    siteName: "RAVAN SHIPPING",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "RAVAN SHIPPING",
      },
    ],
  },
};

import { SplashAnimation } from "@/components/common/SplashAnimation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <SplashAnimation />
        <ThemeProvider>
          <CurrencyProvider>
            <DemoProvider>
              <SystemProvider>
                <NotificationProvider>
                  {children}
                </NotificationProvider>
              </SystemProvider>
            </DemoProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
