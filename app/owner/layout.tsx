import React from "react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "DropAI — Owner Super Admin Command Center",
  description: "Restricted Access: DropAI Platform Owner Control Center",
};

export default function OwnerRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">{children}</div>;
}
