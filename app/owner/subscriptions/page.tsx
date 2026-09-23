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
  AlertCircle,
  XCircle,
  QrCode,
  Building,
  Check,
  X,
  Wallet,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function OwnerSubscriptionsPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});
  const [pendingInvoices, setPendingInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);
  const [processingInvoiceId, setProcessingInvoiceId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Receiving Payout Settings (Where customer payments will arrive)
  const [payoutForm, setPayoutForm] = useState({
    OWNER_UPI_ID: "",
    OWNER_UPI_NAME: "",
    OWNER_PAYPAL_EMAIL: "",
    OWNER_BANK_NAME: "",
    OWNER_BANK_ACCOUNT_NAME: "",
    OWNER_BANK_ACCOUNT_NUMBER: "",
    OWNER_BANK_IFSC_SWIFT: "",
    OWNER_BANK_BRANCH: "",
  });
  const [savingPayout, setSavingPayout] = useState(false);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/subscriptions");
      const data = await res.json();
      setPlans(data.plans || []);
      setUserCounts(data.userCountByPlan || {});
      setPendingInvoices(data.pendingInvoices || []);
      if (data.payoutSettings) {
        setPayoutForm(data.payoutSettings);
      }
    } catch (err) {
      console.error("Owner subscriptions load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleSavePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPayout(true);
    setActionSuccess(null);
    try {
      const res = await fetch("/api/owner/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_payout_settings",
          settings: payoutForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save receiving account details");
      setActionSuccess("Receiving Bank & UPI details successfully updated! Customers will now see these details.");
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      alert(err.message || "Failed to save receiving account settings");
    } finally {
      setSavingPayout(false);
    }
  };

  const handleApproveInvoice = async (invoiceId: string) => {
    if (!confirm("Are you sure you have verified the payment in your bank/UPI account? This will immediately activate the merchant's subscription.")) {
      return;
    }

    setProcessingInvoiceId(invoiceId);
    setActionSuccess(null);
    try {
      const res = await fetch("/api/owner/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_invoice", invoiceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve payment");
      setActionSuccess(data.message || "Payment approved and plan activated!");
      setTimeout(() => setActionSuccess(null), 4000);
      loadPlans();
    } catch (err: any) {
      alert(err.message || "Failed to approve payment");
    } finally {
      setProcessingInvoiceId(null);
    }
  };

  const handleRejectInvoice = async (invoiceId: string) => {
    const reason = prompt("Enter reason for rejection (e.g. UTR not received in bank account / invalid reference):");
    if (reason === null) return;

    setProcessingInvoiceId(invoiceId);
    setActionSuccess(null);
    try {
      const res = await fetch("/api/owner/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject_invoice", invoiceId, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject payment");
      setActionSuccess("Payment has been declined.");
      setTimeout(() => setActionSuccess(null), 4000);
      loadPlans();
    } catch (err: any) {
      alert(err.message || "Failed to reject payment");
    } finally {
      setProcessingInvoiceId(null);
    }
  };

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

  const qrPreviewUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `upi://pay?pa=${payoutForm.OWNER_UPI_ID || "owner@okhdfcbank"}&pn=${encodeURIComponent(
      payoutForm.OWNER_UPI_NAME || "DropAI Platform"
    )}&cu=INR`
  )}`;

  return (
    <OwnerShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight font-mono">
              SUBSCRIPTION &amp; PAYOUT MANAGER
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              OWNER REVENUE &amp; BANK SETTLEMENT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure where customer payments will arrive (UPI &amp; Bank), approve pending UTR receipts, and manage subscription tiers.
          </p>
        </div>

        <button
          onClick={loadPlans}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          Refresh
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* SECTION 1: WHERE CUSTOMER PAYMENTS ARRIVE (UPI & BANK DETAILS CONFIGURATION) */}
      <div className="rounded-2xl bg-slate-950 border border-emerald-500/40 overflow-hidden shadow-2xl">
        <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-emerald-300 font-mono">
                YOUR RECEIVING ACCOUNTS (Where Plan Purchase Money Will Arrive)
              </h2>
              <p className="text-[11px] text-slate-400">
                Enter your UPI ID and Bank Account details below. Customers will transfer directly into these accounts. You can edit anytime.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            EDITABLE 24/7
          </span>
        </div>

        <form onSubmit={handleSavePayout} className="p-5 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: UPI & QR Code Settings */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-white font-mono font-bold text-xs border-b border-slate-800 pb-2">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>PRIMARY UPI &amp; QR CODE SETTINGS</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    Your Real UPI ID (VPA) <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={payoutForm.OWNER_UPI_ID}
                    onChange={(e) => setPayoutForm({ ...payoutForm, OWNER_UPI_ID: e.target.value })}
                    placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    PhonePe, Google Pay, Paytm, or BHIM UPI ID where customer funds arrive.
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    Merchant / Payee Display Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={payoutForm.OWNER_UPI_NAME}
                    onChange={(e) => setPayoutForm({ ...payoutForm, OWNER_UPI_NAME: e.target.value })}
                    placeholder="e.g. DropAI Commercial or Your Real Name"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    The name displayed to customers in their payment app when scanning your QR code.
                  </span>
                </div>

                {/* Live QR Preview */}
                <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="p-1.5 bg-white rounded-lg shrink-0 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrPreviewUrl} alt="Live UPI QR" className="w-20 h-20 object-contain" />
                  </div>
                  <div className="text-xs space-y-0.5 font-mono">
                    <span className="text-[10px] uppercase text-emerald-400 font-bold block">Live Customer QR Preview</span>
                    <p className="text-white font-bold text-xs truncate max-w-[180px]">{payoutForm.OWNER_UPI_NAME || "DropAI Platform"}</p>
                    <p className="text-amber-400 text-[11px] truncate max-w-[180px]">{payoutForm.OWNER_UPI_ID || "owner@okhdfcbank"}</p>
                    <p className="text-[10px] text-slate-500">Auto-updates as you type your UPI ID</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    International PayPal Account / Email (Optional)
                  </label>
                  <input
                    type="text"
                    value={payoutForm.OWNER_PAYPAL_EMAIL}
                    onChange={(e) => setPayoutForm({ ...payoutForm, OWNER_PAYPAL_EMAIL: e.target.value })}
                    placeholder="e.g. yourname@gmail.com or paypal.me/yourusername"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Displayed to international customers when they select the PayPal payment option.
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: Bank Account Settings */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-white font-mono font-bold text-xs border-b border-slate-800 pb-2">
                <Building className="w-4 h-4 text-blue-400" />
                <span>DIRECT BANK TRANSFER (NEFT / IMPS / WIRE)</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">
                    Account Holder Name (As per Bank Passbook)
                  </label>
                  <input
                    type="text"
                    value={payoutForm.OWNER_BANK_ACCOUNT_NAME}
                    onChange={(e) => setPayoutForm({ ...payoutForm, OWNER_BANK_ACCOUNT_NAME: e.target.value })}
                    placeholder="e.g. Your Full Name or Company Name"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={payoutForm.OWNER_BANK_NAME}
                      onChange={(e) => setPayoutForm({ ...payoutForm, OWNER_BANK_NAME: e.target.value })}
                      placeholder="e.g. State Bank of India, HDFC"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">Account Number</label>
                    <input
                      type="text"
                      value={payoutForm.OWNER_BANK_ACCOUNT_NUMBER}
                      onChange={(e) => setPayoutForm({ ...payoutForm, OWNER_BANK_ACCOUNT_NUMBER: e.target.value })}
                      placeholder="e.g. 50200084920194"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={payoutForm.OWNER_BANK_IFSC_SWIFT}
                      onChange={(e) => setPayoutForm({ ...payoutForm, OWNER_BANK_IFSC_SWIFT: e.target.value })}
                      placeholder="e.g. SBIN0004567"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">Branch / City</label>
                    <input
                      type="text"
                      value={payoutForm.OWNER_BANK_BRANCH}
                      onChange={(e) => setPayoutForm({ ...payoutForm, OWNER_BANK_BRANCH: e.target.value })}
                      placeholder="e.g. Main Branch, Mumbai"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Saved securely in Neon PostgreSQL. Customers only see public payment details.</span>
            </div>

            <button
              type="submit"
              disabled={savingPayout}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingPayout ? "Saving Details..." : "Save Receiving Account Details"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: PENDING PAYMENT CONFIRMATIONS TABLE */}
      <div className="rounded-2xl bg-slate-950 border border-amber-500/30 overflow-hidden shadow-xl">
        <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-amber-300 font-mono">
              PENDING PAYMENT VERIFICATIONS &amp; PLAN ACTIVATIONS ({pendingInvoices.length})
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Verify payment in your bank/UPI before approving.
          </span>
        </div>

        {pendingInvoices.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-mono">
            <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
            No pending payments. All merchant payments are up to date.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Merchant</th>
                  <th className="px-4 py-3">Plan Requested</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">UTR / Reference Number</th>
                  <th className="px-4 py-3">Submitted At</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pendingInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{inv.user?.name || "Merchant"}</div>
                      <div className="text-[11px] text-slate-400 font-sans">{inv.user?.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {inv.planCode} ({inv.billingPeriod || "Monthly"})
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400 text-sm">
                      ${inv.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {inv.paymentMethod === "RAZORPAY_UPI" ? "UPI / QR Code" : String(inv.paymentMethod).replace("_", " ")}
                    </td>
                    <td className="px-4 py-3 text-amber-300 font-bold bg-amber-500/5 max-w-xs truncate" title={inv.paymentReference}>
                      {inv.paymentReference || "No UTR provided"}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px] font-sans">
                      {new Date(inv.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={processingInvoiceId === inv.id}
                          onClick={() => handleApproveInvoice(inv.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm disabled:opacity-50 transition-colors"
                          title="Verify and activate subscription"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve &amp; Activate
                        </button>
                        <button
                          disabled={processingInvoiceId === inv.id}
                          onClick={() => handleRejectInvoice(inv.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 font-bold text-[11px] flex items-center gap-1 disabled:opacity-50 transition-colors"
                          title="Reject invalid transaction"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 3: COMMERCIAL PRICING TIERS & RESOURCE CEILINGS */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-400 uppercase font-mono tracking-wider">
          Commercial Pricing Tiers &amp; Resource Ceilings
        </h2>
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
      </div>
    </OwnerShell>
  );
}
