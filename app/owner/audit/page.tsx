"use client";

import React, { useState, useEffect } from "react";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { FileText, Search, Filter, RefreshCw, Terminal, ArrowRight } from "lucide-react";

export default function OwnerAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetType, setTargetType] = useState("ALL");
  const [severity, setSeverity] = useState("ALL");
  const [search, setSearch] = useState("");

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/owner/audit?targetType=${targetType}&severity=${severity}&search=${encodeURIComponent(search)}`
      );
      const json = await res.json();
      setLogs(json.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [targetType, severity]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs();
  };

  return (
    <OwnerShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight font-mono">
              IMMUTABLE OWNER AUDIT TRAIL
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              TAMPER-PROOF LEDGER
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete cryptographic audit log of all administrative actions, re-authentications, and mutations.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
        <form onSubmit={handleSearch} className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, target ID, IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="USER">Users</option>
            <option value="AI">AI Matrix</option>
            <option value="SUBSCRIPTION">Subscriptions</option>
            <option value="SHIPPING">Shipping</option>
            <option value="PROFIT">Profit</option>
            <option value="SYSTEM">System</option>
            <option value="SECURITY">Security</option>
            <option value="AUTH">Authentication</option>
          </select>

          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[11px]">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Owner Actor</th>
                <th className="px-4 py-3">Action Identifier</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Mutation Delta (Prev → New)</th>
                <th className="px-4 py-3 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-white">{log.owner?.name || "Owner"}</span>
                    <span className="text-[10px] text-slate-500 block">{log.ipAddress || "Internal IP"}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-amber-400 whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{log.targetType}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.severity === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                          : log.severity === "HIGH" || log.severity === "WARNING"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                      }`}
                    >
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-slate-400 text-[11px]">
                    {log.previousValue && <span className="text-rose-400/80">{log.previousValue.slice(0, 35)}... → </span>}
                    {log.newValue ? <span className="text-emerald-400/80">{log.newValue.slice(0, 35)}</span> : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-400">
                    {log.result}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No matching audit records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </OwnerShell>
  );
}
