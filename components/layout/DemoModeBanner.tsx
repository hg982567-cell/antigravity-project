"use client";

import React from "react";
import { useDemo } from "@/components/providers/DemoContext";
import { Sparkles, Store, ShieldCheck, ArrowRight } from "lucide-react";

export function DemoModeBanner() {
  const { isDemoMode, toggleDemoMode } = useDemo();

  return (
    <div className={`px-4 py-2 text-xs font-medium border-b transition-colors flex flex-wrap items-center justify-between gap-2 ${
      isDemoMode
        ? "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200"
        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-200"
    }`}>
      <div className="flex items-center gap-2">
        {isDemoMode ? (
          <>
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px]">
              Seed / Demo Data Active
            </span>
            <span className="hidden sm:inline text-slate-600 dark:text-slate-400">
              Displaying simulated catalog & orders for platform evaluation. No fake data presented as real.
            </span>
          </>
        ) : (
          <>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px]">
              Live Store Mode
            </span>
            <span className="hidden sm:inline text-slate-600 dark:text-slate-400">
              Only authentic connected store data is displayed. Disconnected channels show setup wizards.
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleDemoMode}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
            isDemoMode
              ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          }`}
        >
          {isDemoMode ? "Switch to Live Store Data" : "Switch to Demo Mode"}
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
