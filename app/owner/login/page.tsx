"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Lock, ArrowRight, AlertTriangle, Terminal, Eye, EyeOff, Mail, KeyRound } from "lucide-react";
import { signInWithFirebase, signInWithGooglePopup, formatFirebaseAuthError } from "@/lib/firebase/client";

export default function OwnerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@123456");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showMfa, setShowMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let idToken: string | null = null;

      // 1. Attempt authentication via Firebase
      try {
        const user = await signInWithFirebase(email.trim(), password);
        idToken = await user.getIdToken();
      } catch (fbErr: any) {
        // If Firebase is not configured or in dev mode, allow backend fallback
        console.warn("Firebase sign-in note:", fbErr.message);
      }

      // 2. Transmit to Owner authentication endpoint
      const res = await fetch("/api/owner/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken: idToken || undefined,
          email: email.trim(),
          password,
          mfaCode: mfaCode.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed. Please verify owner credentials.");
      }

      // Success: redirect to Owner Command Center
      router.push("/owner/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Authentication rejected.");
      setLoading(false);
    }
  };

  const handleGoogleOwnerLogin = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      const user = await signInWithGooglePopup();
      const idToken = await user.getIdToken();

      const res = await fetch("/api/owner/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const contentType = res.headers.get("content-type") || "";
      let data: any = {};
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON API response from /api/owner/auth/login:", res.status, text.slice(0, 150));
        throw new Error(`Owner authentication server returned status ${res.status}. Please refresh and try again.`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Google account does not possess Platform Owner privileges.");
      }

      router.push("/owner/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Owner Google login error:", err);
      const friendlyError = formatFirebaseAuthError(err);
      if (friendlyError) {
        setError(friendlyError);
      }
      setGoogleLoading(false);
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

        {/* Google Admin Sign-In */}
        <div className="mb-5">
          <button
            type="button"
            onClick={handleGoogleOwnerLogin}
            disabled={googleLoading || loading}
            className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-700 rounded-2xl text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-50 font-mono"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{googleLoading ? "Authenticating Admin..." : "Sign in with Google Admin"}</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-slate-900 px-2 text-slate-500 font-mono">Or with Master Credentials</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Owner Email Identifier
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@123456 or owner email"
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
                placeholder="Enter administrator password"
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
            disabled={loading || googleLoading}
            className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {loading ? "Authenticating Master Session..." : "Sign In to Admin Command Center"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

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
