"use client";

import React, { useState, useEffect } from "react";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { ReAuthModal } from "@/components/owner/ReAuthModal";
import {
  ShieldAlert,
  Lock,
  Key,
  Radio,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  RotateCw,
  Layers,
  Laptop,
  Smartphone,
  Tablet,
} from "lucide-react";

export default function OwnerSecurityPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ReAuth State
  const [reAuthOpen, setReAuthOpen] = useState(false);
  const [reAuthAction, setReAuthAction] = useState<any | null>(null);

  const loadSecurity = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/security");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurity();
  }, []);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await fetch("/api/owner/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke_session", sessionId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      loadSecurity();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTestIntegration = async (integrationId: string) => {
    try {
      const res = await fetch("/api/owner/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_integration", integrationId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      loadSecurity();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Trigger ReAuth for rotating keys or revoking all sessions
  const requestRotateKey = (integration: any) => {
    const newKey = prompt(
      `Enter new real API/Secret key for ${integration.displayName} (or leave empty to generate rotation token):`
    );
    if (newKey === null) return;
    setReAuthAction({
      type: "rotate_api_key",
      integrationId: integration.id,
      newApiKey: newKey,
      title: `Rotate Secret Key: ${integration.displayName}`,
      description: "Updating this integration secret requires explicit Owner password + MFA re-authentication.",
    });
    setReAuthOpen(true);
  };

  const requestRevokeAll = () => {
    setReAuthAction({
      type: "revoke_all_sessions",
      title: "Revoke All Active User Sessions",
      description: "This will instantly log out every merchant and user on the platform. Requires Owner re-authentication.",
      isDestructive: true,
    });
    setReAuthOpen(true);
  };

  const handleReAuthConfirm = async (password: string, mfaCode: string) => {
    if (!reAuthAction) return;
    try {
      const res = await fetch("/api/owner/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: reAuthAction.type,
          integrationId: reAuthAction.integrationId,
          newApiKey: reAuthAction.newApiKey,
          password,
          mfaCode,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Operation failed");
      alert(json.message || "Operation confirmed.");
      loadSecurity();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <OwnerShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight font-mono">
              SECURITY & API SURVEILLANCE
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
              ZERO-TRUST AUDIT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitor active device sessions, rotate masked API secrets, inspect security anomalies, and revoke tokens.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSecurity}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
            Refresh
          </button>
          <button
            onClick={requestRevokeAll}
            className="px-3.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Revoke All User Sessions
          </button>
        </div>
      </div>

      {/* Connected API Integrations (Masked Secrets) */}
      <div id="api" className="space-y-4">
        <h3 className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-400" />
          Enterprise API Integrations & Masked Secrets
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.apiIntegrations || []).map((api: any) => (
            <div key={api.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{api.displayName}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                    api.status === "CONNECTED"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {api.status}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">Encrypted Key Identifier</span>
                <span className="text-amber-400 font-bold tracking-wider">{api.apiKeyMasked || "NOT_CONFIGURED"}</span>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-400">
                <span>Latency: <strong className="text-white">{api.latencyMs ? `${api.latencyMs}ms` : "N/A"}</strong></span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleTestIntegration(api.id)}
                    className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-semibold"
                    title="Test Roundtrip Latency"
                  >
                    Ping
                  </button>
                  <button
                    onClick={() => requestRotateKey(api)}
                    className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 text-[10px] font-semibold flex items-center gap-1"
                    title="Rotate Key with Re-Auth"
                  >
                    <RotateCw className="w-3 h-3" />
                    Rotate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Device Sessions */}
      <div id="sessions" className="space-y-4">
        <h3 className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          Active Multi-Tenant Device Sessions
        </h3>

        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[11px]">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Device & Browser</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">Last Active</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {(data?.activeSessions || []).map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-bold text-white">{s.user?.name}</span>
                        <p className="text-[11px] text-slate-400">{s.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {s.deviceType} • {s.browser}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{s.ipAddress}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(s.lastActiveAt).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRevokeSession(s.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-[11px] font-semibold"
                      >
                        Terminate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ReAuth Modal */}
      {reAuthOpen && (
        <ReAuthModal
          isOpen={reAuthOpen}
          onClose={() => {
            setReAuthOpen(false);
            setReAuthAction(null);
          }}
          onConfirm={handleReAuthConfirm}
          title={reAuthAction?.title || "Owner Security Verification"}
          actionDescription={reAuthAction?.description || "Execute sensitive security action"}
          isDestructive={reAuthAction?.isDestructive}
        />
      )}
    </OwnerShell>
  );
}
