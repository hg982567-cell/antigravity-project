"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Lock, ArrowRight, AlertTriangle, Terminal, Eye, EyeOff, Mail, KeyRound } from "lucide-react";

export default function OwnerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("owner@dropai.io");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showMfa, setShowMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/owner/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          mfaCode: mfaCode.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed. Please verify credentials.");
      }

      // Success: redirect to Owner Command Center
      router.push("/owner/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Authentication rejected.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-950">
      {/* Security Ticker */}
      <div className="mb-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
        <Terminal className="w-3.5 h-3.5 text-amber-400" />
        <span>SUPER ADMIN GATEWAY • ZERO TRUST ENCRYPTED NODE</span>
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
            Platform Owner &amp; Super Administrator Gateway
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Owner Email Identifier
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@dropai.io or your admin email"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-slate-600 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Owner Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password (e.g. admin123)"
                className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-slate-600 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Optional MFA Toggle */}
          <div>
            {!showMfa ? (
              <button
                type="button"
                onClick={() => setShowMfa(true)}
                className="text-[11px] text-amber-400/80 hover:text-amber-300 transition-colors flex items-center gap-1 font-mono"
              >
                <span>+ Have a 2FA code / backup token? (Optional)</span>
              </button>
            ) : (
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Authentication Code (Optional)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="998822 or backup token"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-slate-700"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {loading ? "Authenticating Master Session..." : "Sign In to Admin Command Center"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Credentials Reminder */}
        <div className="mt-5 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center">
          <p className="text-[11px] text-amber-300/90 font-mono">
            🔑 <strong>Default Master Access:</strong>
          </p>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            Email: <code className="text-amber-300">owner@dropai.io</code> | Password: <code className="text-amber-300">admin123</code>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center space-y-3">
          <div className="pt-1">
            <Link
              href="/app/dashboard"
              className="text-[11px] font-mono text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1.5"
            >
              <span>← Return to Merchant Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
