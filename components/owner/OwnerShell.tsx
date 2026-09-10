"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OwnerSidebar } from "@/components/owner/OwnerSidebar";
import {
  Menu,
  X,
  Shield,
  Radio,
  AlertOctagon,
  FileText,
  Clock,
  UserCheck,
  Store,
} from "lucide-react";
import Link from "next/link";

interface OwnerShellProps {
  children: React.ReactNode;
}

export function OwnerShell({ children }: OwnerShellProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [lockdownActive, setLockdownActive] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.isOwner) {
          setIsAuthorized(true);
        } else {
          router.replace("/owner/login");
        }
      })
      .catch(() => {
        router.replace("/owner/login");
      })
      .finally(() => setCheckingAuth(false));
  }, [router]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace("GMT", "UTC"));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10 animate-pulse">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <p className="text-xs font-mono text-slate-400 font-semibold tracking-wider uppercase">
            Verifying Owner Cryptographic Authorization...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full">
        <OwnerSidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-72 h-full">
            <OwnerSidebar onCloseMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Execution View */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900">
        {/* Command Center Top Telemetry Bar */}
        <header className="h-14 border-b border-slate-800 bg-slate-950/90 backdrop-blur px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${lockdownActive ? "bg-rose-400" : "bg-emerald-400"}`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${lockdownActive ? "bg-rose-500" : "bg-emerald-500"}`} />
              </span>
              <span className="text-xs font-mono font-bold text-slate-300 hidden sm:inline">
                {lockdownActive ? "EMERGENCY LOCKDOWN ACTIVE" : "OWNER NODE LIVE"}
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{currentTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/app/dashboard"
              className="px-2.5 py-1 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/60 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Launch DropAI Merchant Platform"
            >
              <Store className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">DropAI App</span>
            </Link>

            <Link
              href="/owner/system#lockdown"
              className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Emergency Switch</span>
            </Link>

            <Link
              href="/owner/audit"
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Audit Stream</span>
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">
                OW
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-bold text-slate-200 leading-none">DropAI Owner</p>
                <p className="text-[10px] font-mono text-amber-400 mt-0.5">ROLE: SUPER_ADMIN</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-900">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
