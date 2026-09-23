"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
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
} from "lucide-react";

export default function BillingPage() {
  const { formatPrice } = useCurrency();
  const [billingData, setBillingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Payment Checkout Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE_CARD" | "RAZORPAY_UPI" | "PAYPAL" | "BANK_WIRE">("STRIPE_CARD");

  // Payment Form Fields
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("888");
  const [upiId, setUpiId] = useState("");
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

  const currentPlan = billingData?.plan || "PRO";
  const plans = billingData?.plans || [];
  const aiRemaining = billingData?.aiCreditsRemaining ?? 4820;
  const aiTotal = billingData?.aiCreditsTotal ?? 5000;
  const aiPercent = Math.min(100, Math.round((aiRemaining / Math.max(1, aiTotal)) * 100));
  const ordersCount = billingData?.ordersProcessedCount ?? 6;
  const storesCount = billingData?.connectedStoresCount ?? 2;
  const invoices = billingData?.invoices || [];

  const handleOpenPayment = (plan: any) => {
    setSelectedPlan(plan);
    setCheckoutSuccess(null);
    setCheckoutError(null);
    setPaymentModalOpen(true);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setProcessing(true);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/app/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: selectedPlan.code,
          paymentMethod,
          billingCycle,
          paymentDetails: {
            cardNumber: paymentMethod === "STRIPE_CARD" ? cardNumber : undefined,
            upiId: paymentMethod === "RAZORPAY_UPI" ? upiId : undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Payment transaction declined.");
      }

      setCheckoutSuccess(data);
      fetchBilling();
    } catch (err: any) {
      setCheckoutError(err.message || "Failed to process payment. Please verify details.");
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
              Subscription, Billing &amp; Payment Gateways
            </h1>
            <Badge variant="purple" size="sm">
              <Sparkles className="w-3 h-3 mr-1" />
              {currentPlan} ACTIVE PLAN
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your subscription tier, billing methods, and official tax invoice receipts.
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
            <p className="text-[11px] text-slate-400">Renews monthly with active tier</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-500">Connected Stores</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">{storesCount}</span>
            </div>
            <p className="text-[11px] text-slate-400">Shopify &amp; WooCommerce active connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-500">Orders Routed</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">{ordersCount}</span>
            </div>
            <p className="text-[11px] text-slate-400">Zero overage fees on active plans</p>
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
                Scale your store with dedicated high-speed AI inference and higher SKU limits.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p: any) => {
              const isCurrent = currentPlan.toUpperCase() === p.code.toUpperCase();
              return (
                <div
                  key={p.code}
                  className={`p-6 rounded-2xl flex flex-col justify-between border transition-all ${
                    isCurrent
                      ? "border-blue-600 dark:border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
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
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                        {formatPrice(p.priceMonthly)}
                      </span>
                      <span className="text-xs text-slate-500">/ month</span>
                    </div>

                    <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span><strong>{p.aiCreditsLimit.toLocaleString()}</strong> AI Inference Credits</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span><strong>{p.productLimit.toLocaleString()}</strong> Catalog SKUs</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span><strong>{p.storeLimit}</strong> Connected Stores</span>
                      </li>
                      {p.apiAccess && (
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>Direct API &amp; Webhook Access</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <button
                    disabled={isCurrent}
                    onClick={() => handleOpenPayment(p)}
                    className={`mt-6 w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      isCurrent
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default"
                        : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/25 active:scale-98"
                    }`}
                  >
                    {isCurrent ? "Current Active Plan" : `Upgrade to ${p.name}`}
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
          <CardTitle className="text-sm">Billing Invoices &amp; Official Receipts</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically verified transaction records stored permanently in your account ledger.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200/60 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Invoice Number</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Plan / Description</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {invoices.map((inv: any) => (
                  <tr key={inv.id || inv.invoiceNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-sans">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-700 dark:text-slate-300">
                      {inv.planName || inv.planCode} ({inv.billingPeriod || "Monthly"})
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-600 dark:text-slate-400">
                      {String(inv.paymentMethod || "STRIPE_CARD").replace("_", " ")}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {formatPrice(inv.amount)}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                        {inv.paymentStatus || "PAID"}
                      </span>
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Multi-Gateway Payment Checkout Modal */}
      {paymentModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            {checkoutSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Payment Successful!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your subscription has been activated to the <strong>{selectedPlan.name}</strong> tier.
                  Invoice <strong>{checkoutSuccess.invoice.invoiceNumber}</strong> has been saved.
                </p>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-left space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transaction ID:</span>
                    <span className="font-mono text-slate-900 dark:text-white">{checkoutSuccess.invoice.paymentReference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Charged:</span>
                    <span className="font-mono font-bold text-emerald-600">{formatPrice(checkoutSuccess.invoice.amount)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setPaymentModalOpen(false)}
                  className="mt-4 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm"
                >
                  Done &amp; Return to Dashboard
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Complete Upgrade to {selectedPlan.name}
                      </h3>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          gatewayConfig?.gatewayMode === "LIVE"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {gatewayConfig?.gatewayMode === "LIVE" ? "LIVE PRODUCTION" : "TEST SANDBOX"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select your preferred payment gateway to activate tier features.
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
                        { id: "STRIPE_CARD", label: "Credit Card", icon: CreditCard },
                        { id: "RAZORPAY_UPI", label: "UPI / QR", icon: QrCode },
                        { id: "PAYPAL", label: "PayPal", icon: Sparkles },
                        { id: "BANK_WIRE", label: "Bank Wire", icon: Building },
                      ].map((m) => {
                        const Icon = m.icon;
                        const isSelected = paymentMethod === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPaymentMethod(m.id as any)}
                            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
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

                  {/* Payment Details Input Fields */}
                  {paymentMethod === "STRIPE_CARD" && (
                    <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Expires (MM/YY)
                          </label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="12/28"
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            CVC
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            required
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder="888"
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "RAZORPAY_UPI" && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                            `upi://pay?pa=${gatewayConfig?.upiDetails?.upiId || "owner@okhdfcbank"}&pn=${encodeURIComponent(
                              gatewayConfig?.upiDetails?.upiName || "DropAI Commercial"
                            )}&cu=INR`
                          )}`}
                          alt="Merchant UPI QR Code"
                          className="w-20 h-20 shrink-0 rounded-lg p-1 bg-white border border-slate-200"
                        />
                        <div className="text-xs space-y-0.5 text-center sm:text-left">
                          <p className="font-bold text-slate-800 dark:text-white">
                            Pay to: {gatewayConfig?.upiDetails?.upiName || "DropAI Commercial Payouts"}
                          </p>
                          <p className="font-mono text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                            {gatewayConfig?.upiDetails?.upiId || "owner@okhdfcbank"}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Scan with GooglePay, PhonePe, Paytm, or enter your VPA below.
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Your UPI Virtual Payment Address (VPA)
                        </label>
                        <input
                          type="text"
                          required
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. you@okhdfcbank or 9876543210@paytm"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === "PAYPAL" && (
                    <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <p className="font-semibold text-blue-900 dark:text-blue-300">PayPal Express Checkout</p>
                      <p>You will authorize the recurring merchant subscription securely via PayPal.</p>
                    </div>
                  )}

                  {paymentMethod === "BANK_WIRE" && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                      <p className="font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-1">
                        Official Beneficiary &amp; Wire Transfer Details:
                      </p>
                      <div className="font-mono text-[11px] space-y-0.5 text-slate-700 dark:text-slate-300">
                        <p>Bank: <strong className="text-slate-900 dark:text-white">{gatewayConfig?.bankDetails?.bankName || "HDFC Bank Ltd"}</strong></p>
                        <p>Beneficiary: <strong className="text-slate-900 dark:text-white">{gatewayConfig?.bankDetails?.accountName || "DropAI Technologies Commercial"}</strong></p>
                        <p>Account #: <strong className="text-amber-600 dark:text-amber-400 font-bold">{gatewayConfig?.bankDetails?.accountNumber || "50200084920194"}</strong></p>
                        <p>IFSC / SWIFT: <strong className="text-slate-900 dark:text-white">{gatewayConfig?.bankDetails?.ifscSwift || "HDFC0001234 / HDFCINBB"}</strong></p>
                        <p>Branch: <span className="text-slate-500">{gatewayConfig?.bankDetails?.branch || "Financial District, Mumbai"}</span></p>
                      </div>
                      <p className="text-[10px] text-slate-400 pt-1">
                        Reference your invoice number in the transfer description for instant automated reconciliation.
                      </p>
                    </div>
                  )}

                  {/* Price Summary */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Plan:</span>
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
                      disabled={processing}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      {processing ? "Authorizing Payment..." : "Pay & Activate Subscription"}
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
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  RECEIPT {activeReceipt.invoiceNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  Tax Invoice &amp; Payment Verification
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
                <span className="text-slate-500">Gateway Reference:</span>
                <span className="font-mono text-slate-900 dark:text-white text-[11px]">{activeReceipt.paymentReference || "pi_verified_auth"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Gateway:</span>
                <span className="text-slate-900 dark:text-white font-semibold">{activeReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-sm">
                <span className="text-slate-900 dark:text-white">Amount Paid:</span>
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
