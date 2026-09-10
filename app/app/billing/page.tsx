"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  CreditCard,
  Sparkles,
  CheckCircle2,
  Download,
  ShieldCheck,
  ArrowRight,
  Zap,
  RefreshCw,
} from "lucide-react";

export default function BillingPage() {
  const [billingData, setBillingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null);

  const fetchBilling = async () => {
    try {
      const res = await fetch("/api/app/data?type=billing");
      const data = await res.json();
      setBillingData(data);
    } catch (err) {
      console.error("Billing fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const currentPlan = billingData?.plan || "PRO";
  const plans = billingData?.plans || [];
  const aiRemaining = billingData?.aiCreditsRemaining ?? 4820;
  const aiTotal = billingData?.aiCreditsTotal ?? 5000;
  const aiPercent = Math.min(100, Math.round((aiRemaining / Math.max(1, aiTotal)) * 100));
  const ordersCount = billingData?.ordersProcessedCount ?? 6;
  const storesCount = billingData?.connectedStoresCount ?? 2;

  const invoices = [
    { id: "INV-2026-009", date: "Sep 1, 2026", amount: "$79.00", status: "PAID", pdf: "invoice_sep26.pdf" },
    { id: "INV-2026-008", date: "Aug 1, 2026", amount: "$79.00", status: "PAID", pdf: "invoice_aug26.pdf" },
    { id: "INV-2026-007", date: "Jul 1, 2026", amount: "$79.00", status: "PAID", pdf: "invoice_jul26.pdf" },
  ];

  const handleUpgrade = (planCode: string) => {
    setSelectedUpgrade(planCode);
    setUpgradeModalOpen(true);
  };

  const confirmUpgrade = async () => {
    if (selectedUpgrade) {
      try {
        await fetch("/api/app/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "change_plan", plan: selectedUpgrade }),
        });
        setUpgradeModalOpen(false);
        fetchBilling();
      } catch (err) {
        console.error("Failed to change plan:", err);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Subscription & Usage Quotas
            </h1>
            <Badge variant="purple" size="sm">
              <Sparkles className="w-3 h-3 mr-1" />
              {currentPlan} MERCHANT PLAN
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Live tier allocations controlled via the DropAI Master Admin Center.
          </p>
        </div>

        <button
          onClick={fetchBilling}
          className="self-start px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-500" : ""}`} />
          <span>Sync Plan</span>
        </button>
      </div>

      {/* Usage Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-500">AI Credits Balance</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {aiRemaining.toLocaleString()} / {aiTotal.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${aiPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">Renews monthly with active tier</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-500">Orders Processed</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {ordersCount} Live Orders
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[12%]" />
            </div>
            <p className="text-[11px] text-slate-400">Automated 3PL routing active</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-500">Connected Stores</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {storesCount} Stores Active
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full w-[40%]" />
            </div>
            <p className="text-[11px] text-slate-400">Shopify & WooCommerce synchronized</p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Details & Dynamic DB Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Available Platform Plans (Managed by Admin)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {plans.map((p: any) => {
              const isCurrent = p.code.toUpperCase() === currentPlan.toUpperCase();
              return (
                <div
                  key={p.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between relative transition-all ${
                    isCurrent
                      ? "border-2 border-blue-600 bg-blue-50/20 dark:bg-blue-950/20 shadow-lg"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40"
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold tracking-wider">
                      CURRENT ACTIVE PLAN
                    </span>
                  )}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        {p.code}
                      </span>
                    </div>

                    <p className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-3">
                      ${p.priceMonthly.toLocaleString()}
                      <span className="text-xs text-slate-500 font-normal"> / mo</span>
                    </p>

                    <ul className="mt-4 space-y-2 text-slate-600 dark:text-slate-300">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Up to <strong>{p.storeLimit}</strong> Connected Store{p.storeLimit > 1 ? "s" : ""}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span><strong>{p.orderLimit.toLocaleString()}</strong> Automated Orders / mo</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span><strong>{p.aiCreditsLimit.toLocaleString()}</strong> AI Inference Credits</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span><strong>{p.productLimit.toLocaleString()}</strong> Catalog SKUs</span>
                      </li>
                      {p.apiAccess && (
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>Direct API & Webhook Access</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <button
                    disabled={isCurrent}
                    onClick={() => handleUpgrade(p.code)}
                    className={`mt-5 w-full py-2 rounded-xl text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-blue-600 text-white cursor-default shadow-md"
                        : "border border-slate-300 dark:border-slate-700 hover:bg-blue-600 hover:text-white text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {isCurrent ? "Active Plan" : `Switch to ${p.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Billing Invoices & Receipts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200/60 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Invoice ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{inv.id}</td>
                  <td className="px-4 py-3 text-slate-500 font-sans">{inv.date}</td>
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{inv.amount}</td>
                  <td className="px-4 py-3 font-sans">
                    <Badge variant="success" size="sm">{inv.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-sans">
                    <button
                      onClick={() => alert(`Simulating PDF download for ${inv.id}`)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {upgradeModalOpen && (
        <Modal
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
          title={`Confirm ${selectedUpgrade} Plan Migration`}
          description="Your billing cycle will be prorated automatically."
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Are you sure you want to switch your subscription to the <strong>{selectedUpgrade}</strong> tier?
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpgrade}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
              >
                Confirm Upgrade
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
