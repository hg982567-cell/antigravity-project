"use client";

import React, { useState, useEffect } from "react";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { ReAuthModal } from "@/components/owner/ReAuthModal";
import { Database, ShieldCheck, RefreshCw, Plus, CheckCircle2, AlertTriangle, HardDrive } from "lucide-react";

export default function OwnerRecoveryPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ReAuth State
  const [reAuthOpen, setReAuthOpen] = useState(false);

  const loadRecovery = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/recovery");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecovery();
  }, []);

  const handleCreateSnapshot = async () => {
    const label = prompt("Enter checkpoint snapshot label:", "Manual Owner Pre-Update Checkpoint");
    if (!label) return;

    try {
      const res = await fetch("/api/owner/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_snapshot", label }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      alert("Snapshot registered successfully.");
      loadRecovery();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTriggerRecovery = async (password: string, mfaCode: string) => {
    try {
      const res = await fetch("/api/owner/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger_recovery", password, mfaCode }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      alert(json.message);
      loadRecovery();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const snapshots = data?.backupSnapshots || [];
  const mig = data?.migrationStatus || {};

  return (
    <OwnerShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight font-mono">
              BACKUP & DISASTER RECOVERY
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              POINT-IN-TIME RECOVERY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitor write-ahead log backups, automated cloud snapshots, database migration consistency, and cold standby nodes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadRecovery}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleCreateSnapshot}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Checkpoint
          </button>
        </div>
      </div>

      {/* Migration & Schema Health Overview */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Relational Schema & Migration Consistency
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            {mig.status || "SYNCHRONIZED"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Schema Version</span>
            <span className="font-bold text-white mt-1 block">{mig.currentSchemaVersion}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Database Engine</span>
            <span className="font-bold text-white mt-1 block">{mig.databaseEngine}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Managed Tables</span>
            <span className="font-bold text-white mt-1 block">{mig.tableCount} tables</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Database Records</span>
            <span className="font-bold text-emerald-400 mt-1 block">
              {(mig.recordStats?.users || 0) + (mig.recordStats?.orders || 0) + (mig.recordStats?.products || 0)} rows
            </span>
          </div>
        </div>
      </div>

      {/* Snapshots Table */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden space-y-3">
        <div className="px-5 pt-4 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-amber-400" />
            Verified Cloud Backup Snapshots
          </h3>
          <button
            onClick={() => setReAuthOpen(true)}
            className="text-xs text-rose-400 hover:text-rose-300 font-mono underline"
          >
            Disaster Recovery Health Gate
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[11px]">
                <th className="px-4 py-3">Snapshot Identifier</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {snapshots.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3">
                    <span className="font-bold text-white block">{s.label}</span>
                    <span className="text-[10px] text-slate-500">{s.id}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{s.type}</td>
                  <td className="px-4 py-3 text-slate-300 font-bold">{s.sizeMb} MB</td>
                  <td className="px-4 py-3 text-slate-400">{new Date(s.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ReAuth Modal for Disaster Recovery */}
      {reAuthOpen && (
        <ReAuthModal
          isOpen={reAuthOpen}
          onClose={() => setReAuthOpen(false)}
          onConfirm={handleTriggerRecovery}
          title="Disaster Recovery Verification"
          actionDescription="Triggering replica failover and disaster recovery check requires explicit Owner password + MFA."
          isDestructive={true}
        />
      )}
    </OwnerShell>
  );
}
