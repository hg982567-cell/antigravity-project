import React from "react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "RAVAN SHIPPING — Owner Super Admin Command Center",
  description: "Restricted Access: RAVAN SHIPPING Platform Owner Control Center",
  icons: {
    icon: "/logo.png",
  },
};

export default function OwnerRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">{children}</div>;
}
