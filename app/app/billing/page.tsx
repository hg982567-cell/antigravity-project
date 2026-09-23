"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useCurrency } from "@/components/providers/CurrencyContext";
import {
  CreditCard,
  Sparkles,
  CheckCircle2,
  Download,
  ShieldCheck,
  ArrowRight,
  Zap,
  RefreshCw,
  QrCode,
  Building,
  Lock,
  FileText,
  AlertCircle,
  Clock,
  Check,
} from "lucide-react";

export default function BillingPage() {
  const { formatPrice } = useCurrency();
  const [billingData, setBillingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Payment Checkout Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY_UPI" | "BANK_WIRE" | "STRIPE_CARD" | "PAYPAL">("RAZORPAY_UPI");

  // Payment Form Fields
  const [utrNumber, setUtrNumber] = useState("");
  const [payerName, setPayerName] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [paypalRef, setPaypalRef] = useState("");

  const [processing, setProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<any | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Selected Invoice Modal for viewing receipt
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);
  const [gatewayConfig, setGatewayConfig] = useState<any>(null);

  const fetchBilling = async () => {
    try {
      const [res, configRes] = await Promise.all([
        fetch("/api/app/data?type=billing"),
        fetch("/api/app/billing/config").catch(() => null),
      ]);
      const data = await res.json();
      setBillingData(data);
      if (configRes && configRes.ok) {
        const configData = await configRes.json();
        setGatewayConfig(configData);
      }
    } catch (err) {
      console.error("Billing fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const currentPlan = (billingData?.plan || "FREE").toUpperCase();
  const plans = billingData?.plans || [];
  const aiRemaining = billingData?.aiCreditsRemaining ?? 100;
  const aiTotal = billingData?.aiCreditsTotal ?? 100;
  const aiPercent = Math.min(100, Math.round((aiRemaining / Math.max(1, aiTotal)) * 100));
  const ordersCount = billingData?.ordersProcessedCount ?? 0;
  const storesCount = billingData?.connectedStoresCount ?? 1;
  const invoices = billingData?.invoices || [];

  const handleOpenPayment = (plan: any) => {
    setSelectedPlan(plan);
    setCheckoutSuccess(null);
    setCheckoutError(null);
    setUtrNumber("");
    setPayerName("");
    setPayerPhone("");
    setPaypalRef("");
    setPaymentModalOpen(true);
  };

  const handleDowngradeToFree = async () => {
    if (!confirm("Are you sure you want to switch to the Free Tier? Paid plan features will be paused and limits will reset to 1 store and 100 AI credits.")) {
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch("/api/app/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode: "FREE" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to switch to Free Tier.");
      }
      alert("Successfully switched to Free Tier.");
      fetchBilling();
    } catch (err: any) {
      alert(err.message || "Failed to switch plan.");
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setProcessing(true);
    setCheckoutError(null);

    // Validation
    if (paymentMethod === "STRIPE_CARD") {
      setCheckoutError("Automated card payments are currently under maintenance. Please select UPI or Bank Wire for direct account verification.");
      setProcessing(false);
      return;
    }

    if (paymentMethod === "RAZORPAY_UPI") {
      if (!utrNumber.trim() || utrNumber.trim().length < 6) {
        setCheckoutError("Please enter your 12-digit UPI UTR / Transaction Reference number from your payment app (Google Pay / PhonePe / Paytm).");
        setProcessing(false);
        return;
      }
      if (!payerName.trim()) {
        setCheckoutError("Please enter the Payer Name / Account holder name.");
        setProcessing(false);
        return;
      }
    }

    if (paymentMethod === "BANK_WIRE") {
      if (!utrNumber.trim() || utrNumber.trim().length < 6) {
        setCheckoutError("Please enter the Bank Transfer UTR / Transaction Reference number.");
        setProcessing(false);
        return;
      }
      if (!payerName.trim()) {
        setCheckoutError("Please enter the Remitter / Account holder name.");
        setProcessing(false);
        return;
      }
    }

    if (paymentMethod === "PAYPAL") {
      if (!paypalRef.trim()) {
        setCheckoutError("Please enter your PayPal Transaction ID.");
        setProcessing(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/app/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: selectedPlan.code,
          paymentMethod,
          billingCycle,
          paymentDetails: {
            utrNumber: paymentMethod === "PAYPAL" ? paypalRef.trim() : utrNumber.trim(),
            payerName: payerName.trim(),
            payerPhone: payerPhone.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Payment verification failed.");
      }

      setCheckoutSuccess(data);
      fetchBilling();
    } catch (err: any) {
      setCheckoutError(err.message || "Failed to submit payment verification. Please check your details.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Subscription &amp; Billing
            </h1>
            <Badge variant={currentPlan === "FREE" ? "default" : "purple"} size="sm">
              <Sparkles className="w-3 h-3 mr-1" />
              {currentPlan} ACTIVE PLAN
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your account tier, verified payment methods, and bank invoice receipts.
          </p>
        </div>

        <button
          onClick={fetchBilling}
          className="self-start px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-500" : ""}`} />
          <span>Sync Billing</span>
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
            <p className="text-[11px] text-slate-400">
              {currentPlan === "FREE" ? "Free Tier includes 100 introductory AI credits" : "Renews monthly with active subscription"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-500">Connected Stores</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">{storesCount}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {currentPlan === "FREE" ? "Max 1 store on Free Tier" : "Shopify & WooCommerce active connections"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-500">Orders Routed</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">{ordersCount}</span>
            </div>
            <p className="text-[11px] text-slate-400">Direct supplier automated routing</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Plans Grid */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle>Merchant Subscription Tiers</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                New accounts start permanently on the Free Tier until upgraded via verified account payment.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((p: any) => {
              const isCurrent = currentPlan === p.code.toUpperCase();
              const isFree = p.code.toUpperCase() === "FREE";

              return (
                <div
                  key={p.code}
                  className={`p-5 rounded-2xl flex flex-col justify-between border transition-all relative ${
                    isCurrent
                      ? "border-blue-600 dark:border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 shadow-md ring-1 ring-blue-500"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">{p.name}</h3>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                        {p.priceMonthly === 0 ? "Free" : formatPrice(p.priceMonthly)}
                      </span>
                      {p.priceMonthly > 0 && <span className="text-xs text-slate-500">/ mo</span>}
                      {p.priceMonthly === 0 && <span className="text-xs text-slate-400">Forever</span>}
                    </div>

                    <ul className="mt-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span><strong>{p.aiCreditsLimit.toLocaleString()}</strong> AI Credits</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span><strong>{p.productLimit.toLocaleString()}</strong> Catalog SKUs</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span><strong>{p.storeLimit}</strong> Connected Store{p.storeLimit > 1 ? "s" : ""}</span>
                      </li>
                      {p.apiAccess && (
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>Direct API &amp; Webhooks</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="mt-6">
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default"
                      >
                        Current Active Plan
                      </button>
                    ) : isFree ? (
                      <button
                        onClick={handleDowngradeToFree}
                        disabled={processing}
                        className="w-full py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Downgrade to Free
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenPayment(p)}
                        className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm hover:shadow-blue-500/25 active:scale-98"
                      >
                        Upgrade to {p.name}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Billing Invoices &amp; Payment Receipts</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Real verification records. Upgrades are activated once payment is confirmed in the platform bank/UPI account.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200/60 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Plan / Tier</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">UTR / Reference</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400 font-sans">
                      No invoices recorded yet. You are currently on the Free Tier.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv: any) => {
                    const status = inv.paymentStatus || "PENDING";
                    return (
                      <tr key={inv.id || inv.invoiceNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          {inv.invoiceNumber}
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-sans">
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-sans text-slate-700 dark:text-slate-300 font-semibold">
                          {inv.planName || inv.planCode} ({inv.billingPeriod || "Monthly"})
                        </td>
                        <td className="px-4 py-3 font-sans text-slate-600 dark:text-slate-400">
                          {String(inv.paymentMethod || "UPI").replace("_", " ")}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-[11px] max-w-[160px] truncate" title={inv.paymentReference}>
                          {inv.paymentReference || "—"}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200 font-mono">
                          {formatPrice(inv.amount)}
                        </td>
                        <td className="px-4 py-3 font-sans">
                          {status === "PAID" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 inline-flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              PAID &amp; ACTIVE
                            </span>
                          )}
                          {status === "PENDING" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 animate-pulse" />
                              PENDING VERIFICATION
                            </span>
                          )}
                          {status === "REJECTED" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800">
                              DECLINED
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-sans">
                          <button
                            onClick={() => setActiveReceipt(inv)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-semibold"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Receipt
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Verified Payment Checkout Modal */}
      {paymentModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            {checkoutSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-sm ${
                  checkoutSuccess.pendingVerification
                    ? "bg-amber-100 dark:bg-amber-950 text-amber-600"
                    : "bg-emerald-100 dark:bg-emerald-950 text-emerald-600"
                }`}>
                  {checkoutSuccess.pendingVerification ? (
                    <Clock className="w-8 h-8 animate-pulse" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8" />
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {checkoutSuccess.pendingVerification
                    ? "Payment Submitted — Verification Pending"
                    : "Payment Successful!"}
                </h3>

                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {checkoutSuccess.pendingVerification ? (
                    <span>
                      Your payment reference has been recorded for invoice{" "}
                      <strong>{checkoutSuccess.invoice?.invoiceNumber}</strong>. Our finance team will verify receipt in the platform bank/UPI account and activate your <strong>{selectedPlan.name}</strong> plan shortly.
                    </span>
                  ) : (
                    <span>
                      Your subscription has been activated to the <strong>{selectedPlan.name}</strong> tier.
                    </span>
                  )}
                </p>

                {checkoutSuccess.invoice && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-left space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Invoice Number:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {checkoutSuccess.invoice.invoiceNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Submitted Reference:</span>
                      <span className="font-mono text-slate-900 dark:text-white text-[11px]">
                        {checkoutSuccess.invoice.paymentReference}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment Status:</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        {checkoutSuccess.invoice.paymentStatus || "PENDING"} (Awaiting Bank Confirmation)
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1">
                      <span className="text-slate-400">Total Amount:</span>
                      <span className="font-mono font-bold text-emerald-600">
                        {formatPrice(checkoutSuccess.invoice.amount)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-[11px] text-blue-700 dark:text-blue-300 text-left">
                  ℹ️ <strong>Note:</strong> Your account safely remains on your current tier until the payment is verified. You can track this verification anytime under Billing Invoices above.
                </div>

                <button
                  onClick={() => setPaymentModalOpen(false)}
                  className="mt-4 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm"
                >
                  Done &amp; Return to Billing
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Upgrade to {selectedPlan.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verified Account Transfer • No fake card instant charges
                    </p>
                  </div>
                  <button
                    onClick={() => setPaymentModalOpen(false)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>

                {checkoutError && (
                  <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                <form onSubmit={handleProcessPayment} className="space-y-4 mt-4">
                  {/* Billing Cycle Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Billing Cycle
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setBillingCycle("MONTHLY")}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${
                          billingCycle === "MONTHLY"
                            ? "border-blue-600 bg-blue-50/20 dark:bg-blue-950/30 text-slate-900 dark:text-white font-bold"
                            : "border-slate-200 dark:border-slate-800 text-slate-500"
                        }`}
                      >
                        <div>Monthly Billing</div>
                        <div className="text-xs font-mono mt-0.5">{formatPrice(selectedPlan.priceMonthly)}/mo</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBillingCycle("YEARLY")}
                        className={`p-3 rounded-xl border text-left text-xs transition-all relative ${
                          billingCycle === "YEARLY"
                            ? "border-blue-600 bg-blue-50/20 dark:bg-blue-950/30 text-slate-900 dark:text-white font-bold"
                            : "border-slate-200 dark:border-slate-800 text-slate-500"
                        }`}
                      >
                        <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[9px] font-bold">
                          SAVE 20%
                        </span>
                        <div>Annual Billing</div>
                        <div className="text-xs font-mono mt-0.5">
                          {formatPrice(Math.round(selectedPlan.priceMonthly * 12 * 0.8))}/yr
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Select Payment Method
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "RAZORPAY_UPI", label: "UPI / QR", icon: QrCode, badge: "Recommended" },
                        { id: "BANK_WIRE", label: "Bank Wire", icon: Building },
                        { id: "STRIPE_CARD", label: "Card", icon: CreditCard },
                        { id: "PAYPAL", label: "PayPal", icon: Sparkles },
                      ].map((m) => {
                        const Icon = m.icon;
                        const isSelected = paymentMethod === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPaymentMethod(m.id as any)}
                            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all relative ${
                              isSelected
                                ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold shadow-xs"
                                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-[11px]">{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Method 1: Instant UPI / QR */}
                  {paymentMethod === "RAZORPAY_UPI" && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                            `upi://pay?pa=${gatewayConfig?.upiDetails?.upiId || "owner@okhdfcbank"}&pn=${encodeURIComponent(
                              gatewayConfig?.upiDetails?.upiName || "DropAI Platform Commercial"
                            )}&cu=INR`
                          )}`}
                          alt="Platform Owner UPI QR Code"
                          className="w-24 h-24 shrink-0 rounded-lg p-1 bg-white border border-slate-200"
                        />
                        <div className="text-xs space-y-1 text-center sm:text-left">
                          <p className="font-bold text-slate-900 dark:text-white">
                            Payee: {gatewayConfig?.upiDetails?.upiName || "DropAI Platform Commercial"}
                          </p>
                          <p className="font-mono text-amber-600 dark:text-amber-400 font-bold text-xs select-all">
                            UPI ID: {gatewayConfig?.upiDetails?.upiId || "owner@okhdfcbank"}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            1. Scan with Google Pay, PhonePe, Paytm, or BHIM.
                            <br />
                            2. Pay the total amount shown below.
                            <br />
                            3. Enter your <strong>12-digit UTR number</strong> from your app receipt.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            12-Digit UPI Transaction ID / UTR Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value)}
                            placeholder="e.g. 428190382910 (Check payment details in GPay/PhonePe)"
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Sender / Payer Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={payerName}
                              onChange={(e) => setPayerName(e.target.value)}
                              placeholder="e.g. Ramesh Kumar"
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Phone Number (Optional)
                            </label>
                            <input
                              type="tel"
                              value={payerPhone}
                              onChange={(e) => setPayerPhone(e.target.value)}
                              placeholder="e.g. 9876543210"
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Method 2: Bank Wire */}
                  {paymentMethod === "BANK_WIRE" && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-3">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-1">
                          Official Platform Bank Account Details:
                        </p>
                        <div className="font-mono text-[11px] space-y-0.5 text-slate-700 dark:text-slate-300 mt-2">
                          <p>Bank: <strong className="text-slate-900 dark:text-white">{gatewayConfig?.bankDetails?.bankName || "HDFC Bank Ltd"}</strong></p>
                          <p>Beneficiary: <strong className="text-slate-900 dark:text-white">{gatewayConfig?.bankDetails?.accountName || "DropAI Technologies Commercial"}</strong></p>
                          <p>Account #: <strong className="text-amber-600 dark:text-amber-400 font-bold select-all">{gatewayConfig?.bankDetails?.accountNumber || "50200084920194"}</strong></p>
                          <p>IFSC Code: <strong className="text-slate-900 dark:text-white select-all">{gatewayConfig?.bankDetails?.ifscSwift || "HDFC0001234"}</strong></p>
                          <p>Branch: <span className="text-slate-500">{gatewayConfig?.bankDetails?.branch || "Financial District, Mumbai"}</span></p>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Bank Transfer UTR / Transaction Reference <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value)}
                            placeholder="e.g. HDFC2026092100492 or CMS190283"
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Account Holder / Remitter Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={payerName}
                            onChange={(e) => setPayerName(e.target.value)}
                            placeholder="e.g. Ramesh Kumar"
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Method 3: Stripe Card (Notice) */}
                  {paymentMethod === "STRIPE_CARD" && (
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Instant Card Processing Offline</span>
                      </div>
                      <p>
                        Instant automated card upgrades without real payment verification have been disabled to ensure total platform security and prevent unauthorized plan elevations.
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        👉 Please choose <strong>UPI / QR</strong> or <strong>Bank Wire</strong> above to make a direct transfer to the platform owner account. Once submitted, your UTR is verified and your plan is activated.
                      </p>
                    </div>
                  )}

                  {/* Payment Method 4: PayPal */}
                  {paymentMethod === "PAYPAL" && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                      <p className="font-semibold text-slate-900 dark:text-white">International PayPal Transfer</p>
                      <p className="text-slate-500">
                        Send payment to our commercial PayPal account: <strong>billing@dropai.io</strong>
                      </p>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          PayPal Transaction ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={paypalRef}
                          onChange={(e) => setPaypalRef(e.target.value)}
                          placeholder="e.g. 9KL294819X"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Price Summary */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Selected Plan:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedPlan.name} ({billingCycle})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Platform Processing Fee:</span>
                      <span className="text-emerald-600 font-semibold">$0.00 (Waived)</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white">
                      <span>Total Due Today:</span>
                      <span className="font-mono text-blue-600">
                        {formatPrice(
                          billingCycle === "YEARLY"
                            ? Math.round(selectedPlan.priceMonthly * 12 * 0.8)
                            : selectedPlan.priceMonthly
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setPaymentModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processing || paymentMethod === "STRIPE_CARD"}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      {processing ? "Submitting Verification..." : "Submit Payment for Verification"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Official Invoice Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  RECEIPT {activeReceipt.invoiceNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  Tax Invoice &amp; Payment Record
                </h3>
              </div>
              <button
                onClick={() => setActiveReceipt(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Date Issued:</span>
                <span className="text-slate-900 dark:text-white font-mono">{new Date(activeReceipt.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billed For:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{activeReceipt.planName || activeReceipt.planCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">UTR / Reference:</span>
                <span className="font-mono text-slate-900 dark:text-white text-[11px] select-all font-bold">{activeReceipt.paymentReference || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="text-slate-900 dark:text-white font-semibold">{activeReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verification Status:</span>
                <span className={`font-mono font-bold ${
                  activeReceipt.paymentStatus === "PAID"
                    ? "text-emerald-600"
                    : activeReceipt.paymentStatus === "PENDING"
                    ? "text-amber-600"
                    : "text-red-600"
                }`}>
                  {activeReceipt.paymentStatus || "PENDING"}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-sm">
                <span className="text-slate-900 dark:text-white">Amount:</span>
                <span className="font-mono text-emerald-600">{formatPrice(activeReceipt.amount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveReceipt(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
