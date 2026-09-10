"use client";

import React, { useState, useEffect } from "react";
import { OwnerShell } from "@/components/owner/OwnerShell";
import {
  Cpu,
  Layers,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function OwnerAiPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadAiConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/ai");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAiConfig();
  }, []);

  const handleUpdateRouting = async (ruleId: string, updates: any) => {
    try {
      const res = await fetch("/api/owner/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_routing_rule",
          ruleId,
          data: updates,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update routing rule");
      loadAiConfig();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleProviderStatus = async (provider: any) => {
    const nextStatus = provider.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    try {
      const res = await fetch("/api/owner/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_provider",
          providerId: provider.id,
          data: { status: nextStatus },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update provider status");
      loadAiConfig();
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
              AI COMMAND CENTER
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
              NEURAL ROUTING MATRIX
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure multi-model AI providers, task-specific inference routing, fallback policies, and token ceilings.
          </p>
        </div>

        <button
          onClick={loadAiConfig}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          Refresh
        </button>
      </div>

      {/* AI Providers Overview */}
      <div id="providers" className="space-y-4">
        <h3 className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          Configured AI Providers & Ensembles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(data?.providers || []).map((prov: any) => {
            const models = JSON.parse(prov.modelsJson || "[]");
            const isActive = prov.status === "ACTIVE";
            return (
              <div key={prov.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{prov.displayName}</span>
                    {prov.isDefault && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {prov.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="text-[11px] font-mono text-slate-400">
                    Supported Models: <strong className="text-slate-200">{models.join(", ")}</strong>
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">
                    Rate Limit: <strong className="text-slate-200">{prov.rateLimitPerMin} req/min</strong>
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">
                    Daily Token Cap: <strong className="text-slate-200">{(prov.dailyTokenLimit / 1000000).toFixed(1)}M tokens</strong>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">Priority Tier: #{prov.priority}</span>
                  <button
                    onClick={() => handleToggleProviderStatus(prov)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-slate-900 hover:bg-slate-800 text-rose-400 border border-slate-800"
                        : "bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/50"
                    }`}
                  >
                    {isActive ? "Disable Provider" : "Enable Provider"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Routing Matrix */}
      <div id="routing" className="space-y-4">
        <h3 className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          Task-to-Model Routing Matrix
        </h3>

        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[11px]">
                  <th className="px-4 py-3">Platform Intelligence Task</th>
                  <th className="px-4 py-3">Assigned Provider</th>
                  <th className="px-4 py-3">Target Model</th>
                  <th className="px-4 py-3">Temperature</th>
                  <th className="px-4 py-3">Max Output Tokens</th>
                  <th className="px-4 py-3 text-right">Routing Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {(data?.routingRules || []).map((rule: any) => (
                  <tr key={rule.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-white">
                      {rule.taskType.replace(/_/g, " ")}
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={rule.providerName}
                        onChange={(e) => handleUpdateRouting(rule.id, { providerName: e.target.value })}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-400 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="OPENAI">OpenAI</option>
                        <option value="ANTHROPIC">Anthropic</option>
                        <option value="GOOGLE">Google Gemini</option>
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      <input
                        type="text"
                        defaultValue={rule.modelName}
                        onBlur={(e) => handleUpdateRouting(rule.id, { modelName: e.target.value })}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs w-48 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </td>

                    <td className="px-4 py-3 text-slate-400 font-semibold">
                      {rule.temperature}
                    </td>

                    <td className="px-4 py-3 text-slate-400">
                      {rule.maxTokens} tokens
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleUpdateRouting(rule.id, { isEnabled: !rule.isEnabled })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rule.isEnabled
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {rule.isEnabled ? "ACTIVE ROUTE" : "PAUSED"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </OwnerShell>
  );
}
