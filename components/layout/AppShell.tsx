"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { DemoModeBanner } from "@/components/layout/DemoModeBanner";
import { AlertOctagon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lockdown, setLockdown] = useState<any>(null);

  useEffect(() => {
    fetch("/api/system/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.lockdownActive) {
          setLockdown(data);
        }
      })
      .catch(() => null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex">
      {/* Persistent Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        {/* Emergency Lockdown Alert if engaged by Owner */}
        {lockdown?.lockdownActive && (
          <div className="bg-rose-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-md z-50">
            <div className="flex items-center gap-2 max-w-4xl truncate">
              <AlertOctagon className="w-4 h-4 shrink-0 animate-pulse text-amber-200" />
              <span>
                PLATFORM EMERGENCY NOTICE: DropAI is in read-only administrative lockdown ({lockdown.reason || "System Maintenance"}).
              </span>
            </div>
            <Link
              href="/owner/system#lockdown"
              className="text-[11px] font-mono underline hover:text-amber-200 shrink-0 ml-3"
            >
              Owner Console →
            </Link>
          </div>
        )}

        {/* Demo Mode Notice Banner */}
        <DemoModeBanner />

        {/* Global Application TopBar */}
        <TopBar setMobileOpen={setMobileOpen} />

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
