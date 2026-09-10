"use client";

import React, { useState, useEffect } from "react";
import { OwnerShell } from "@/components/owner/OwnerShell";
import {
  CreditCard,
  CheckCircle2,
  DollarSign,
  Package,
  Store,
  ShoppingCart,
  Cpu,
  RefreshCw,
  Save,
  Users,
} from "lucide-react";

export default function OwnerSubscriptionsPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/subscriptions");
      const data = await res.json();
      setPlans(data.plans || []);
      setUserCounts(data.userCountByPlan || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleUpdatePlan = async (planId: string, updatedFields: any) => {
    setSavingPlanId(planId);
    try {
      const res = await fetch("/api/owner/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_plan",
          planId,
          data: updatedFields,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update plan");
      loadPlans();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingPlanId(null);
    }
  };

  return (
    <OwnerShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight font-mono">
              SUBSCRIPTION & PLAN MANAGER
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              COMMERCIAL TIERS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure monthly & annual pricing, product and store ceilings, AI inference allocations, and feature gates.
          </p>
        </div>

        <button
          onClick={loadPlans}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          Refresh Plans
        </button>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {plans.map((p) => {
          const userCount = userCounts[p.code] || 0;
          const isSaving = savingPlanId === p.id;
          return (
            <div key={p.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-white">{p.name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {userCount} Subscribers
                  </span>
                </div>

                {/* Price Editors */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase block mb-1">Monthly ($/mo)</label>
                    <input
                      type="number"
                      defaultValue={p.priceMonthly}
                      onBlur={(e) => handleUpdatePlan(p.id, { priceMonthly: e.target.value })}
                      className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase block mb-1">Yearly ($/yr)</label>
                    <input
                      type="number"
                      defaultValue={p.priceYearly}
                      onBlur={(e) => handleUpdatePlan(p.id, { priceYearly: e.target.value })}
                      className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-bold"
                    />
                  </div>
                </div>

                {/* Resource Limits */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5"><Store className="w-3.5 h-3.5 text-blue-400" /> Storefront Limit:</span>
                    <strong className="text-white">{p.storeLimit} stores</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-emerald-400" /> Product Catalog:</span>
                    <strong className="text-white">{p.productLimit.toLocaleString()} items</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5"><ShoppingCart className="w-3.5 h-3.5 text-amber-400" /> Monthly Orders:</span>
                    <strong className="text-white">{p.orderLimit.toLocaleString()} orders</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-purple-400" /> AI Credits:</span>
                    <strong className="text-purple-300 font-bold">{p.aiCreditsLimit.toLocaleString()} tokens</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold ${p.isActive ? "text-emerald-400" : "text-rose-400"}`}>
                  {p.isActive ? "ACTIVE TIER" : "ARCHIVED"}
                </span>
                <button
                  onClick={() => handleUpdatePlan(p.id, { isActive: !p.isActive })}
                  className="text-xs text-slate-400 hover:text-white underline font-mono"
                >
                  {p.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </OwnerShell>
  );
}
