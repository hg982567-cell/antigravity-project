"use client";

import React, { useState, useEffect } from "react";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { DollarSign, Percent, Save, RefreshCw, Sliders, TrendingUp } from "lucide-react";

export default function OwnerProfitPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/profit");
      const data = await res.json();
      setRules(data.rules || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleUpdate = async (ruleId: string, updatedFields: any) => {
    setSavingId(ruleId);
    try {
      const res = await fetch("/api/owner/profit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_profit_rule",
          ruleId,
          data: updatedFields,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profit rule");
      loadRules();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <OwnerShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight font-mono">
              PROFIT & PRICING CONTROL
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              COMMERCIAL MARGIN ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enforce platform-wide minimum/maximum profit margins, product markup multipliers, and SaaS transaction take rates.
          </p>
        </div>

        <button
          onClick={loadRules}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rules.map((rule) => {
          return (
            <div key={rule.id} className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base text-white">
                    {rule.scope} {rule.targetPlan ? `(${rule.targetPlan})` : "PLATFORM BASELINE"}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  ACTIVE RULE
                </span>
              </div>

              {/* Margin Range Controls */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Margin Boundaries (%)</span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Min Margin</label>
                    <input
                      type="number"
                      defaultValue={rule.minMarginPercent}
                      onBlur={(e) => handleUpdate(rule.id, { minMarginPercent: e.target.value })}
                      className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-rose-400 font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Default Margin</label>
                    <input
                      type="number"
                      defaultValue={rule.defaultMarginPercent}
                      onBlur={(e) => handleUpdate(rule.id, { defaultMarginPercent: e.target.value })}
                      className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-emerald-400 font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Max Margin</label>
                    <input
                      type="number"
                      defaultValue={rule.maxMarginPercent}
                      onBlur={(e) => handleUpdate(rule.id, { maxMarginPercent: e.target.value })}
                      className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-amber-400 font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Multipliers & Platform Fees */}
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <label className="text-[10px] text-slate-400 block mb-1">Product Price Multiplier</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      defaultValue={rule.productMarkup}
                      onBlur={(e) => handleUpdate(rule.id, { productMarkup: e.target.value })}
                      className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-bold"
                    />
                    <span className="text-slate-400">x</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <label className="text-[10px] text-slate-400 block mb-1">Platform Take Fee (%)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      defaultValue={rule.platformFeePercent}
                      onBlur={(e) => handleUpdate(rule.id, { platformFeePercent: e.target.value })}
                      className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-bold"
                    />
                    <span className="text-slate-400">%</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </OwnerShell>
  );
}
