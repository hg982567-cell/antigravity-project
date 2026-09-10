"use client";

import React, { useState, useEffect } from "react";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { Truck, Plus, Trash2, Globe, Shield, RefreshCw } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export default function OwnerShippingPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New rule form
  const [scope, setScope] = useState("GLOBAL");
  const [countryCode, setCountryCode] = useState("US");
  const [methodName, setMethodName] = useState("");
  const [baseCost, setBaseCost] = useState("5.00");
  const [deliveryDays, setDeliveryDays] = useState("5-9 business days");
  const [targetPlan, setTargetPlan] = useState("PRO");

  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/shipping");
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

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/owner/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_rule",
          data: {
            scope,
            countryCode,
            methodName,
            baseCost,
            deliveryDaysEstimate: deliveryDays,
            targetPlan: scope === "PLAN" ? targetPlan : null,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create rule");
      setModalOpen(false);
      setMethodName("");
      loadRules();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this shipping rule?")) return;
    try {
      await fetch("/api/owner/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_rule", ruleId }),
      });
      loadRules();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <OwnerShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight font-mono">
              SHIPPING CONTROL CENTER
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              LOGISTICS MATRIX
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage global factory shipping rates, transit milestones, plan-based delivery tiers, and destination rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadRules}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Shipping Rule
          </button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[11px]">
                <th className="px-4 py-3">Scope</th>
                <th className="px-4 py-3">Country Code</th>
                <th className="px-4 py-3">Carrier / Method</th>
                <th className="px-4 py-3">Base Cost</th>
                <th className="px-4 py-3">Estimated Transit</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 text-slate-300">
                      {r.scope} {r.targetPlan && `(${r.targetPlan})`}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-white">{r.countryCode}</td>
                  <td className="px-4 py-3 text-amber-300">{r.methodName}</td>
                  <td className="px-4 py-3 text-emerald-400 font-bold">${r.baseCost.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-400">{r.deliveryDaysEstimate}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteRule(r.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Rule Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Create New Shipping Profile Rule"
          description="Enforce platform-wide or plan-specific fulfillment rules."
        >
          <form onSubmit={handleCreateRule} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Scope</label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              >
                <option value="GLOBAL">Global (All Users)</option>
                <option value="PLAN">Plan-Based Tier</option>
              </select>
            </div>

            {scope === "PLAN" && (
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Target Plan</label>
                <select
                  value={targetPlan}
                  onChange={(e) => setTargetPlan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="STARTER">Starter</option>
                  <option value="PRO">Pro</option>
                  <option value="BUSINESS">Business</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Destination Country Code</label>
              <input
                type="text"
                required
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                placeholder="US, GB, DE, or *"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Carrier / Method Name</label>
              <input
                type="text"
                required
                value={methodName}
                onChange={(e) => setMethodName(e.target.value)}
                placeholder="e.g. YunExpress Direct VIP"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Base Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={baseCost}
                  onChange={(e) => setBaseCost(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Delivery Estimate</label>
                <input
                  type="text"
                  required
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value)}
                  placeholder="e.g. 4-7 days"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                Save Shipping Rule
              </button>
            </div>
          </form>
        </Modal>
      )}
    </OwnerShell>
  );
}
