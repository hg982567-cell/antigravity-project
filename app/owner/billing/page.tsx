"use client";

import React, { useState, useEffect } from "react";
import { OwnerShell } from "@/components/owner/OwnerShell";
import {
  CreditCard,
  Building,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  Lock,
  ExternalLink,
  DollarSign,
  TrendingUp,
  FileText,
  Mail,
  Zap,
  Globe,
  Radio,
} from "lucide-react";

export default function OwnerBillingPayoutsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<Record<string, string>>({});

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/owner/billing");
      if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
          window.location.href = "/owner/login";
          return;
        }
        throw new Error("Failed to load payment configuration.");
      }
      const json = await res.json();
      setData(json);
      setFormData(json.config || {});
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to load billing configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async (sectionName: string, keys: string[]) => {
    setSavingSection(sectionName);
    setSuccessMessage(null);
    setErrorMessage(null);

    const payload: Record<string, string> = {};
    for (const k of keys) {
      if (formData[k] !== undefined) {
        payload[k] = formData[k];
      }
    }

    try {
      const res = await fetch("/api/owner/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_settings",
          settings: payload,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to save settings");
      }

      setSuccessMessage(`${sectionName} successfully updated and saved to Neon PostgreSQL.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || "Could not save configuration.");
    } finally {
      setSavingSection(null);
    }
  };

  const handleToggleMode = async () => {
    try {
      const res = await fetch("/api/owner/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_mode" }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to switch mode");
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const isLive = formData["PAYMENT_GATEWAY_MODE"] === "LIVE";
  const upiId = formData["OWNER_UPI_ID"] || "owner@okhdfcbank";
  const upiName = formData["OWNER_UPI_NAME"] || "DropAI Commercial Payouts";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&cu=INR`
  )}`;

  return (
    <OwnerShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight font-mono">
              PAYMENT GATEWAYS & OWNER PAYOUT ACCOUNTS
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                isLive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              }`}
            >
              {isLive ? "LIVE PRODUCTION SETTLEMENT" : "SANDBOX / TEST MODE"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure your official bank accounts, UPI IDs, Razorpay, Stripe, and PayPal credentials for merchant subscription revenues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
            Sync Status
          </button>
        </div>
      </div>

      {/* Mode Switcher Banner */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl ${
          isLive
            ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
            : "bg-amber-950/40 border-amber-500/40 text-amber-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isLive
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                : "bg-amber-500/20 border-amber-500/50 text-amber-400"
            }`}
          >
            {isLive ? <Radio className="w-5 h-5 animate-pulse" /> : <Zap className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">
                CURRENT GATEWAY MODE: {isLive ? "LIVE REAL-MONEY PROCESSING" : "TEST / SANDBOX SIMULATION"}
              </span>
            </div>
            <p className="text-xs opacity-90 mt-0.5">
              {isLive
                ? "Active: All customer card checkouts and UPI payments are charged for real and settle directly into your attached bank accounts."
                : "Safe Sandbox: Merchant upgrades simulate successful payment verification, generate invoices, and activate subscriptions without charging real money."}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleMode}
          className={`px-4 py-2 rounded-xl text-xs font-black font-mono tracking-wider transition-all shrink-0 shadow-lg ${
            isLive
              ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
              : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
          }`}
        >
          {isLive ? "SWITCH TO TEST MODE" : "ACTIVATE LIVE PRODUCTION"}
        </button>
      </div>

      {/* Notification Alerts */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Telemetry Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 font-mono uppercase">Total Invoiced GMV</span>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              ${(data?.stats?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <DollarSign className="w-5 h-5 text-emerald-500/40" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Accumulated merchant subscription fees</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 font-mono uppercase">Paid Invoices</span>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-2xl font-black text-white font-mono">
              {data?.stats?.totalInvoicesPaid || 0}
            </span>
            <FileText className="w-5 h-5 text-blue-500/40" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Successfully verified ledger records</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 font-mono uppercase">Connected Channels</span>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-2xl font-black text-amber-400 font-mono">
              {data?.stats?.activeGatewaysCount || 0} / 5
            </span>
            <ShieldCheck className="w-5 h-5 text-amber-500/40" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Bank Wire, UPI, Card, PayPal, Razorpay</span>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Owner Bank Account Details */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono">Owner Bank Account (Direct Wire / IMPS / NEFT)</h3>
                <p className="text-[11px] text-slate-400">Displayed to customers when selecting Bank Wire Transfer</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
              DIRECT PAYOUT
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                Account Holder / Company Name
              </label>
              <input
                type="text"
                value={formData["OWNER_BANK_ACCOUNT_NAME"] || ""}
                onChange={(e) => handleInputChange("OWNER_BANK_ACCOUNT_NAME", e.target.value)}
                placeholder="e.g. DropAI Technologies Commercial or Your Name"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData["OWNER_BANK_NAME"] || ""}
                  onChange={(e) => handleInputChange("OWNER_BANK_NAME", e.target.value)}
                  placeholder="e.g. HDFC Bank, SBI, ICICI"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData["OWNER_BANK_ACCOUNT_NUMBER"] || ""}
                  onChange={(e) => handleInputChange("OWNER_BANK_ACCOUNT_NUMBER", e.target.value)}
                  placeholder="e.g. 50200084920194"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  IFSC / SWIFT-BIC Code
                </label>
                <input
                  type="text"
                  value={formData["OWNER_BANK_IFSC_SWIFT"] || ""}
                  onChange={(e) => handleInputChange("OWNER_BANK_IFSC_SWIFT", e.target.value)}
                  placeholder="e.g. HDFC0001234 / HDFCINBB"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  Branch / City
                </label>
                <input
                  type="text"
                  value={formData["OWNER_BANK_BRANCH"] || ""}
                  onChange={(e) => handleInputChange("OWNER_BANK_BRANCH", e.target.value)}
                  placeholder="e.g. Financial District Branch, Mumbai"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() =>
                  handleSaveSettings("Bank Account", [
                    "OWNER_BANK_NAME",
                    "OWNER_BANK_ACCOUNT_NAME",
                    "OWNER_BANK_ACCOUNT_NUMBER",
                    "OWNER_BANK_IFSC_SWIFT",
                    "OWNER_BANK_BRANCH",
                  ])
                }
                disabled={savingSection === "Bank Account"}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSection === "Bank Account" ? "Saving..." : "Save Bank Account"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: UPI & QR Code Settings (India) */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono">Business UPI & QR Settlement (India)</h3>
                <p className="text-[11px] text-slate-400">Google Pay, PhonePe, Paytm, and BHIM App payments</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              INSTANT UPI
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="sm:col-span-2 space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  Primary Business UPI ID (VPA)
                </label>
                <input
                  type="text"
                  value={formData["OWNER_UPI_ID"] || ""}
                  onChange={(e) => handleInputChange("OWNER_UPI_ID", e.target.value)}
                  placeholder="e.g. owner@okhdfcbank or 9876543210@paytm"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  Merchant / Payee Display Name
                </label>
                <input
                  type="text"
                  value={formData["OWNER_UPI_NAME"] || ""}
                  onChange={(e) => handleInputChange("OWNER_UPI_NAME", e.target.value)}
                  placeholder="e.g. DropAI Commercial Payouts"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() =>
                    handleSaveSettings("UPI Details", ["OWNER_UPI_ID", "OWNER_UPI_NAME"])
                  }
                  disabled={savingSection === "UPI Details"}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingSection === "UPI Details" ? "Saving..." : "Save UPI Settings"}</span>
                </button>
              </div>
            </div>

            {/* Live QR Preview */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase mb-2">Live QR Preview</span>
              <div className="p-2 rounded-lg bg-white shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="UPI QR Preview" className="w-24 h-24 object-contain" />
              </div>
              <span className="text-[10px] text-amber-400 font-mono mt-1 font-bold truncate max-w-[120px]">
                {upiId}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Razorpay Merchant Integration */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono">Razorpay Gateway (Cards, NetBanking, UPI)</h3>
                <p className="text-[11px] text-slate-400">From razorpay.com merchant dashboard</p>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                formData["RAZORPAY_KEY_ID"]
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {formData["RAZORPAY_KEY_ID"] ? "ATTACHED" : "NOT ATTACHED"}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                Razorpay Key ID
              </label>
              <input
                type="text"
                value={formData["RAZORPAY_KEY_ID"] || ""}
                onChange={(e) => handleInputChange("RAZORPAY_KEY_ID", e.target.value)}
                placeholder="rzp_live_... or rzp_test_..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                Razorpay Key Secret
              </label>
              <input
                type="password"
                value={formData["RAZORPAY_KEY_SECRET"] || ""}
                onChange={(e) => handleInputChange("RAZORPAY_KEY_SECRET", e.target.value)}
                placeholder={formData["RAZORPAY_KEY_SECRET_MASKED"] || "Enter Razorpay Secret"}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() =>
                  handleSaveSettings("Razorpay", ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"])
                }
                disabled={savingSection === "Razorpay"}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-md shadow-indigo-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSection === "Razorpay" ? "Saving..." : "Save Razorpay Keys"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Stripe Enterprise Processing */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono">Stripe Enterprise (Global Credit/Debit Cards)</h3>
                <p className="text-[11px] text-slate-400">From dashboard.stripe.com/apikeys</p>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                formData["STRIPE_PUBLISHABLE_KEY"]
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {formData["STRIPE_PUBLISHABLE_KEY"] ? "ATTACHED" : "NOT ATTACHED"}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                Stripe Publishable Key
              </label>
              <input
                type="text"
                value={formData["STRIPE_PUBLISHABLE_KEY"] || ""}
                onChange={(e) => handleInputChange("STRIPE_PUBLISHABLE_KEY", e.target.value)}
                placeholder="pk_live_... or pk_test_..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                Stripe Secret Key
              </label>
              <input
                type="password"
                value={formData["STRIPE_SECRET_KEY"] || ""}
                onChange={(e) => handleInputChange("STRIPE_SECRET_KEY", e.target.value)}
                placeholder={formData["STRIPE_SECRET_KEY_MASKED"] || "sk_live_... or sk_test_..."}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() =>
                  handleSaveSettings("Stripe", [
                    "STRIPE_PUBLISHABLE_KEY",
                    "STRIPE_SECRET_KEY",
                    "STRIPE_WEBHOOK_SECRET",
                  ])
                }
                disabled={savingSection === "Stripe"}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-md shadow-purple-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSection === "Stripe" ? "Saving..." : "Save Stripe Keys"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 5: PayPal Commercial Gateway */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono">PayPal Commercial Account</h3>
                <p className="text-[11px] text-slate-400">From developer.paypal.com dashboard</p>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                formData["PAYPAL_CLIENT_ID"]
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {formData["PAYPAL_CLIENT_ID"] ? "ATTACHED" : "NOT ATTACHED"}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                PayPal Client ID
              </label>
              <input
                type="text"
                value={formData["PAYPAL_CLIENT_ID"] || ""}
                onChange={(e) => handleInputChange("PAYPAL_CLIENT_ID", e.target.value)}
                placeholder="Enter PayPal REST API Client ID"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                PayPal Secret
              </label>
              <input
                type="password"
                value={formData["PAYPAL_SECRET"] || ""}
                onChange={(e) => handleInputChange("PAYPAL_SECRET", e.target.value)}
                placeholder={formData["PAYPAL_SECRET_MASKED"] || "Enter PayPal Secret"}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() =>
                  handleSaveSettings("PayPal", ["PAYPAL_CLIENT_ID", "PAYPAL_SECRET", "PAYPAL_MODE"])
                }
                disabled={savingSection === "PayPal"}
                className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSection === "PayPal" ? "Saving..." : "Save PayPal Keys"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 6: Business Support & Inbound Email */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono">Business Email & Ticket Destination</h3>
                <p className="text-[11px] text-slate-400">Where customer support complaints & invoices are routed</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              DISPATCH
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                Owner Business Email Address
              </label>
              <input
                type="email"
                value={formData["BUSINESS_SUPPORT_EMAIL"] || ""}
                onChange={(e) => handleInputChange("BUSINESS_SUPPORT_EMAIL", e.target.value)}
                placeholder="e.g. owner@dropai.com or support@yourcompany.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Customer inquiries submitted via <code>/contact</code> and payment receipts are sent to this address.
            </p>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() =>
                  handleSaveSettings("Support Email", ["BUSINESS_SUPPORT_EMAIL"])
                }
                disabled={savingSection === "Support Email"}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSection === "Support Email" ? "Saving..." : "Save Email"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Collected Invoices Table */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              Live Invoiced Payments Stream ({data?.invoices?.length || 0})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Neon PostgreSQL Real Ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-3 px-3">Invoice #</th>
                <th className="pb-3 px-3">Merchant</th>
                <th className="pb-3 px-3">Plan</th>
                <th className="pb-3 px-3">Amount</th>
                <th className="pb-3 px-3">Gateway</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Reference</th>
                <th className="pb-3 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {(data?.invoices || []).map((inv: any) => (
                <tr key={inv.id} className="hover:bg-slate-900/40">
                  <td className="py-3 px-3 font-bold text-amber-400">{inv.invoiceNumber}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-white">{inv.user?.name || "Merchant"}</span>
                    <p className="text-[10px] text-slate-400">{inv.user?.email}</p>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{inv.planName || inv.planCode}</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">${inv.amount.toFixed(2)}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-300">
                      {String(inv.paymentMethod).replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[11px] text-slate-400 truncate max-w-[140px]">
                    {inv.paymentReference || "N/A"}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-500">
                    {new Date(inv.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {(!data?.invoices || data.invoices.length === 0) && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                    No merchant payment invoices recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </OwnerShell>
  );
}
