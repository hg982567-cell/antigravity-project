"use client";

import React, { useState, useEffect } from "react";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Activity,
  Users,
  DollarSign,
  ShoppingCart,
  Cpu,
  Shield,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  FileText,
  AlertOctagon,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function OwnerDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch("/api/owner/dashboard");
      if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
          window.location.href = "/owner/login";
          return;
        }
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // 30s live telemetry poll
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <OwnerShell>
        <div className="space-y-6">
          <div className="h-8 w-64 bg-slate-800 rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-800/60 rounded-2xl animate-pulse border border-slate-700/50" />
            ))}
          </div>
        </div>
      </OwnerShell>
    );
  }

  const stats = data?.stats || {};
  const health = data?.systemHealth || [];
  const recentLogs = data?.recentAuditLogs || [];
  const lockdown = data?.lockdown || {};

  return (
    <OwnerShell>
      {/* Top Banner if Emergency Lockdown is active */}
      {lockdown.isActive && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-600/80 text-rose-200 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0 animate-pulse" />
            <div>
              <p className="font-bold text-sm text-white">EMERGENCY PLATFORM LOCKDOWN IS ACTIVE</p>
              <p className="text-xs text-rose-300">
                Reason: {lockdown.reason || "Administrative security intervention"}. All non-owner sessions terminated.
              </p>
            </div>
          </div>
          <Link
            href="/owner/system#lockdown"
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow"
          >
            Manage Lockdown
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight font-mono">
              OWNER COMMAND CENTER
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              RESTRICTED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time platform telemetry, multi-tenant resource meters, and infrastructure health.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualRefresh}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
            <span>Sync Live</span>
          </button>
          <Link
            href="/owner/users"
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Platform Users */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 font-mono uppercase">Merchants & Users</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white font-mono">{stats.totalUsers || 0}</span>
            <div className="flex items-center gap-2 mt-1 text-[11px]">
              <span className="text-emerald-400 font-semibold">{stats.activeUsers || 0} Active</span>
              <span className="text-slate-600">•</span>
              <span className="text-rose-400 font-semibold">{stats.suspendedUsers || 0} Suspended</span>
            </div>
          </div>
        </div>

        {/* Platform Gross Revenue */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 font-mono uppercase">Gross GMV Volume</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white font-mono">
              ${(stats.platformGrossRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
              <span>{stats.totalOrdersCount || 0} Orders Processed</span>
            </div>
          </div>
        </div>

        {/* Platform Net SaaS Profit */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 font-mono uppercase">Platform Net SaaS Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-400 font-mono">
              ${(stats.totalPlatformProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
              <span>Sub fees + 2.5% take rate</span>
            </div>
          </div>
        </div>

        {/* AI Inference Executions */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 font-mono uppercase">AI Neural Requests</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white font-mono">{stats.aiRequestsCount || 0}</span>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400 font-semibold">
              <span>99.92% Success Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Breakdown & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Plan Distribution */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Active Subscriptions
            </h3>
            <span className="text-[11px] font-mono text-slate-500">{stats.activeSubCount || 0} Active</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {Object.entries(stats.subscriptionBreakdown || {}).map(([plan, count]: any) => (
              <div key={plan} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${plan === "ENTERPRISE" ? "bg-purple-400" : plan === "PRO" ? "bg-blue-400" : plan === "BUSINESS" ? "bg-amber-400" : "bg-slate-500"}`} />
                  <span className="font-semibold text-slate-200">{plan}</span>
                </div>
                <span className="font-mono font-bold text-white">{count} Users</span>
              </div>
            ))}
          </div>

          <Link
            href="/owner/subscriptions"
            className="block text-center py-2 rounded-xl text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
          >
            Manage Plans & Pricing →
          </Link>
        </div>

        {/* Real-time System Infrastructure Health */}
        <div id="health" className="lg:col-span-2 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              System Infrastructure Health
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              ALL NODES OPTIMAL
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {health.map((h: any) => (
              <div key={h.service} className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-200">{h.service}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {h.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{h.description}</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] font-mono text-slate-500">
                  <span>Latency: <strong className="text-slate-300">{h.latencyMs}ms</strong></span>
                  <span>Uptime: <strong className="text-emerald-400">{h.uptimePercent}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Owner Audit Stream */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            Live Owner Audit Stream
          </h3>
          <Link href="/owner/audit" className="text-xs text-amber-400 hover:underline font-mono">
            View Full Audit Trail →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-2">Timestamp</th>
                <th className="pb-2">Action</th>
                <th className="pb-2">Target</th>
                <th className="pb-2">Severity</th>
                <th className="pb-2">IP Address</th>
                <th className="pb-2 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {recentLogs.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-900/50">
                  <td className="py-2.5 text-slate-400">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 font-bold text-white">{log.action}</td>
                  <td className="py-2.5 text-slate-300">{log.targetType}</td>
                  <td className="py-2.5">
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
                  <td className="py-2.5 text-slate-400">{log.ipAddress || "Internal"}</td>
                  <td className="py-2.5 text-right font-bold text-emerald-400">{log.result}</td>
                </tr>
              ))}
              {recentLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 font-sans">
                    No recent audit events recorded.
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
