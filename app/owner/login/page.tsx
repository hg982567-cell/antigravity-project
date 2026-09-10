"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, KeyRound, ArrowRight, CheckCircle2, AlertTriangle, Terminal } from "lucide-react";

export default function OwnerLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Verify Owner Email
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/owner/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok || !data.allowed) {
        throw new Error(data.error || "Access Denied: Unrecognized Owner credentials.");
      }

      setRequiresMfa(data.requiresMfa || false);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to verify Owner authorization.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 & 3: Submit Password and MFA
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/owner/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, mfaCode }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.requiresMfa) {
          setStep(3);
          throw new Error("Two-Factor Authentication required.");
        }
        throw new Error(data.error || "Authentication failed.");
      }

      // Success: redirect to Owner Command Center
      router.push("/owner/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Authentication rejected.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-950">
      {/* Security Warning Ticker */}
      <div className="mb-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
        <Terminal className="w-3.5 h-3.5 text-amber-400" />
        <span>SECURE NODE: ALL SESSIONS IMMUTABLY AUDITED & IP TRACED</span>
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3">
            <Shield className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            DropAI Owner Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Restricted Single-Tenant Super Administrator Gateway
          </p>
        </div>

        {/* Step Progression Indicators */}
        <div className="flex items-center justify-between mb-6 px-4">
          <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${step >= 1 ? "text-amber-400" : "text-slate-600"}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
            <span>Identify</span>
          </div>
          <div className={`h-0.5 flex-1 mx-2 ${step >= 2 ? "bg-amber-500/50" : "bg-slate-800"}`} />
          <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${step >= 2 ? "text-amber-400" : "text-slate-600"}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
            <span>Authorize</span>
          </div>
          <div className={`h-0.5 flex-1 mx-2 ${step >= 3 ? "bg-amber-500/50" : "bg-slate-800"}`} />
          <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${step >= 3 ? "text-amber-400" : "text-slate-600"}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
            <span>MFA</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === 1 && (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Owner Email Identifier
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@dropai.io"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-slate-600"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Only pre-authorized Owner accounts are evaluated.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              {loading ? "Verifying Credentials..." : "Verify Owner Status"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: Password Form */}
        {step === 2 && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between text-slate-400">
              <span className="truncate">{email}</span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-amber-400 hover:underline text-[11px] shrink-0 ml-2"
              >
                Change
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Owner Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              {loading ? "Authenticating..." : requiresMfa ? "Proceed to 2FA" : "Authenticate Session"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 3: MFA / Recovery Code */}
        {step === 3 && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Enter your 6-digit TOTP authenticator or backup recovery code.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Authentication Code
              </label>
              <input
                type="text"
                required
                autoFocus
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="000000"
                maxLength={10}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-center font-mono text-xl tracking-widest text-amber-400 focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-slate-700"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              {loading ? "Validating Token..." : "Verify & Launch Command Center"}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer Warning */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
            UNAUTHORIZED ACCESS IS STRICTLY PROHIBITED AND MONITORED.
            <br />
            ALL IP ADDRESSES AND SESSION ATTEMPTS ARE IMMUTABLY RECORDED.
          </p>
        </div>
      </div>
    </div>
  );
}
