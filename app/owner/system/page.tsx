"use client";

import React, { useState, useEffect } from "react";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { ReAuthModal } from "@/components/owner/ReAuthModal";
import {
  Sliders,
  AlertOctagon,
  Settings,
  Shield,
  CheckCircle2,
  RefreshCw,
  Power,
  Lock,
} from "lucide-react";

export default function OwnerSystemPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Lockdown state
  const [lockdownOpen, setLockdownOpen] = useState(false);
  const [lockdownReason, setLockdownReason] = useState("");

  const loadSystem = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/system");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystem();
  }, []);

  const handleToggleFeature = async (flagId: string, currentVal: boolean) => {
    try {
      const res = await fetch("/api/owner/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_feature",
          flagId,
          isEnabled: !currentVal,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      loadSystem();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      const res = await fetch("/api/owner/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_setting",
          settingKey: key,
          settingValue: value,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      loadSystem();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLockdownConfirm = async (password: string, mfaCode: string) => {
    const nextActive = !data?.lockdown?.isActive;
    try {
      const res = await fetch("/api/owner/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "emergency_lockdown",
          password,
          mfaCode,
          lockdownData: {
            isActive: nextActive,
            disableRegistrations: nextActive,
            disableAiServices: nextActive,
            disableApis: nextActive,
            maintenanceMode: nextActive,
            freezeFinancials: nextActive,
            reason: lockdownReason || "Owner manual emergency lockdown",
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Lockdown trigger failed");
      alert(nextActive ? "EMERGENCY LOCKDOWN ACTIVATED" : "EMERGENCY LOCKDOWN LIFTED");
      loadSystem();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const isLockdownActive = data?.lockdown?.isActive;

  return (
    <OwnerShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight font-mono">
              GLOBAL SYSTEM CONTROL
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              FEATURE GATES & PANIC SWITCH
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Toggle platform-wide feature flags, global configuration parameters, and emergency kill switches.
          </p>
        </div>

        <button
          onClick={loadSystem}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Emergency Lockdown Panic Switch */}
      <div
        id="lockdown"
        className={`p-6 rounded-2xl border transition-all ${
          isLockdownActive
            ? "bg-rose-950/80 border-rose-600 text-white shadow-2xl shadow-rose-950/50"
            : "bg-slate-950 border-slate-800 text-slate-200"
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${isLockdownActive ? "bg-rose-600 text-white animate-pulse" : "bg-rose-950/40 text-rose-400 border border-rose-800/40"}`}>
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base font-mono">EMERGENCY SECURITY MODE</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${isLockdownActive ? "bg-rose-900 text-rose-200" : "bg-slate-800 text-slate-400"}`}>
                  {isLockdownActive ? "STATUS: ACTIVE" : "STANDBY"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Instantly freezes user registrations, AI inference endpoints, and external API webhooks.
                Requires Owner re-authentication to engage or lift.
              </p>
            </div>
          </div>

          <button
            onClick={() => setLockdownOpen(true)}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider font-mono shadow-xl transition-all ${
              isLockdownActive
                ? "bg-white text-rose-900 hover:bg-slate-200 shadow-rose-900/50"
                : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40"
            }`}
          >
            {isLockdownActive ? "LIFT EMERGENCY LOCKDOWN" : "ENGAGE EMERGENCY LOCKDOWN"}
          </button>
        </div>
      </div>

      {/* Feature Flags */}
      <div id="flags" className="space-y-4">
        <h3 className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          Platform Feature Flags
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data?.featureFlags || []).map((flag: any) => (
            <div key={flag.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">{flag.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">({flag.scope})</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{flag.description}</p>
                <p className="text-[10px] font-mono text-amber-400/80 mt-1">Key: {flag.key}</p>
              </div>

              <button
                onClick={() => handleToggleFeature(flag.id, flag.isEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  flag.isEnabled ? "bg-amber-500" : "bg-slate-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    flag.isEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Global Settings */}
      <div id="settings" className="space-y-4">
        <h3 className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center gap-2">
          <Settings className="w-4 h-4 text-blue-400" />
          Global Parameters
        </h3>

        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-4 font-mono text-xs">
          {(data?.settings || []).map((s: any) => (
            <div key={s.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
              <div>
                <span className="font-bold text-white text-xs">{s.key}</span>
                <p className="text-[11px] text-slate-500">{s.description}</p>
              </div>
              <input
                type="text"
                defaultValue={s.value}
                onBlur={(e) => handleUpdateSetting(s.key, e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white sm:w-64 font-mono"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ReAuth Modal for Lockdown */}
      {lockdownOpen && (
        <ReAuthModal
          isOpen={lockdownOpen}
          onClose={() => setLockdownOpen(false)}
          onConfirm={handleLockdownConfirm}
          title={isLockdownActive ? "Lift Emergency Lockdown" : "ENGAGE EMERGENCY LOCKDOWN"}
          actionDescription={
            isLockdownActive
              ? "Confirm restoration of normal platform operations."
              : "CRITICAL: Engaging emergency lockdown will instantly freeze mutations and terminate non-owner sessions."
          }
          isDestructive={!isLockdownActive}
        />
      )}
    </OwnerShell>
  );
}
