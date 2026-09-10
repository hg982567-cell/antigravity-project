"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { DemoModeBanner } from "@/components/layout/DemoModeBanner";
import { AlertOctagon, Wrench, ShieldAlert, Shield, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSystem } from "@/components/providers/SystemContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lockdownActive, lockdownReason, maintenanceMode, platformName, refreshSystem } = useSystem();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          setIsOwner(data.isOwner || data.user.role === "OWNER");
        }
      })
      .catch(() => null)
      .finally(() => setCheckingAuth(false));
  }, []);

  // 1. Account Suspension Screen (Enforced when Owner suspends user in /owner/users)
  if (currentUser?.isSuspended && !isOwner) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center font-mono">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-rose-500/30 space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-tight">
              Account Suspended
            </h1>
            <p className="text-xs text-rose-400 font-semibold mt-2">
              Access Restricted by Platform Administrator
            </p>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-left">
              <strong>Reason:</strong> {currentUser.suspendedReason || "Account policy review in progress. Please contact DropAI operations support."}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2.5">
            <Link
              href="/auth/login"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold transition-all"
            >
              Sign in with another account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Maintenance Mode Screen (Enforced when Owner toggles Maintenance Mode in /owner/system)
  if (maintenanceMode && !isOwner && !checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center font-mono">
        <div className="max-w-lg w-full p-8 rounded-3xl bg-slate-900 border border-amber-500/30 space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Wrench className="w-8 h-8 animate-spin-slow" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
              Scheduled System Upgrade
            </span>
            <h1 className="text-2xl font-black text-white mt-3 tracking-tight">
              {platformName} is undergoing maintenance
            </h1>
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              The Platform Owner has temporarily enabled maintenance mode to perform routine database indexing and infrastructure scaling. All store sales and webhooks continue processing in the background.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-1.5 text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Target Completion:</span>
              <span className="font-bold text-amber-400">~15 minutes</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Autonomous Engines:</span>
              <span className="text-emerald-400 font-bold">Online & Active</span>
            </div>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => refreshSystem()}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Check Status
            </button>
            <Link
              href="/owner/login"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
            >
              <Shield className="w-3.5 h-3.5" />
              Owner Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
        {lockdownActive && (
          <div className="bg-rose-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-md z-50">
            <div className="flex items-center gap-2 max-w-4xl truncate">
              <AlertOctagon className="w-4 h-4 shrink-0 animate-pulse text-amber-200" />
              <span>
                PLATFORM EMERGENCY NOTICE: DropAI is in read-only administrative lockdown ({lockdownReason || "Security Review"}).
              </span>
            </div>
            <Link
              href="/owner/system"
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
