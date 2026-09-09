"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState("PRO");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null);

  const invoices = [
    { id: "INV-2026-009", date: "Sep 1, 2026", amount: "$79.00", status: "PAID", pdf: "invoice_sep26.pdf" },
    { id: "INV-2026-008", date: "Aug 1, 2026", amount: "$79.00", status: "PAID", pdf: "invoice_aug26.pdf" },
    { id: "INV-2026-007", date: "Jul 1, 2026", amount: "$79.00", status: "PAID", pdf: "invoice_jul26.pdf" },
  ];

  const handleUpgrade = (plan: string) => {
    setSelectedUpgrade(plan);
    setUpgradeModalOpen(true);
  };

  const confirmUpgrade = () => {
    if (selectedUpgrade) {
      setCurrentPlan(selectedUpgrade);
      setUpgradeModalOpen(false);
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
            Track your AI token consumption, automated order thresholds, and connected storefront limits.
          </p>
        </div>
      </div>

      {/* Usage Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-500">AI Credits Balance</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">4,820 / 5,000</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full w-[96%]" />
            </div>
            <p className="text-[11px] text-slate-400">Renews on Oct 1, 2026</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-500">Orders Processed</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">142 / 5,000</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[3%]" />
            </div>
            <p className="text-[11px] text-slate-400">Unlimited manual orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-500">Connected Stores</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">2 / 5 Stores</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full w-[40%]" />
            </div>
            <p className="text-[11px] text-slate-400">3 slots available</p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Details & Upgrade Action */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Available Plan Upgrades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Starter</h3>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-2">$29 <span className="text-xs text-slate-500 font-normal">/ mo</span></p>
                <ul className="mt-3 space-y-1.5 text-slate-500">
                  <li>• 1 Connected Store</li>
                  <li>• 200 Automated Orders</li>
                </ul>
              </div>
              <button
                disabled={currentPlan === "STARTER"}
                onClick={() => handleUpgrade("STARTER")}
                className="mt-4 w-full py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold disabled:opacity-50"
              >
                {currentPlan === "STARTER" ? "Current Plan" : "Downgrade"}
              </button>
            </div>

            <div className="p-4 rounded-xl border-2 border-blue-600 bg-blue-50/20 dark:bg-blue-950/20 flex flex-col justify-between relative shadow-sm">
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold">
                ACTIVE PLAN
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Pro Merchant</h3>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-2">$79 <span className="text-xs text-slate-500 font-normal">/ mo</span></p>
                <ul className="mt-3 space-y-1.5 text-slate-600 dark:text-slate-300">
                  <li>• 5 Connected Stores</li>
                  <li>• 5,000 Automated Orders</li>
                  <li>• AI Creative Studio & Radar</li>
                </ul>
              </div>
              <button
                disabled
                className="mt-4 w-full py-1.5 rounded-lg bg-blue-600 text-white font-semibold cursor-default"
              >
                Current Plan
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Enterprise Scale</h3>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-2">$199 <span className="text-xs text-slate-500 font-normal">/ mo</span></p>
                <ul className="mt-3 space-y-1.5 text-slate-500">
                  <li>• Unlimited Stores</li>
                  <li>• Unlimited Orders & 3PL Lines</li>
                </ul>
              </div>
              <button
                onClick={() => handleUpgrade("ENTERPRISE")}
                className="mt-4 w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Upgrade Plan
              </button>
            </div>
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
