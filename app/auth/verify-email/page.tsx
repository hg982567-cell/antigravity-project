"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MailCheck,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
} from "lucide-react";
import {
  getFirebaseUser,
  reloadCurrentUser,
  sendVerificationEmail,
  signOutFromFirebase,
} from "@/lib/firebase/client";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");

  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Load current user email if not in query params
  useEffect(() => {
    const user = getFirebaseUser();
    if (user?.email) {
      setEmail(user.email);
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Check verification status
  const handleCheckStatus = async () => {
    setChecking(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const user = await reloadCurrentUser();

      if (!user) {
        // Attempt session-based check with backend
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.authenticated && data.user?.isEmailVerified) {
          setVerified(true);
          setTimeout(() => router.push("/app/dashboard"), 1500);
          return;
        }
        setErrorMessage("Please sign in with your credentials to verify your account.");
        setChecking(false);
        return;
      }

      if (user.emailVerified) {
        // Email is verified! Sync with backend
        const idToken = await user.getIdToken(true);
        await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        setVerified(true);
        setTimeout(() => {
          router.push("/app/dashboard");
        }, 1500);
      } else {
        setErrorMessage(
          "Your email address has not been verified yet. Please check your inbox (and spam folder) and click the link in the email."
        );
      }
    } catch (err: any) {
      console.error("Verification check error:", err);
      setErrorMessage("Could not verify status. Please try again in a few moments.");
    } finally {
      setChecking(false);
    }
  };

  // Resend verification email with 60-second cooldown
  const handleResendEmail = async () => {
    if (cooldown > 0 || resending) return;

    setResending(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      await sendVerificationEmail();
      setMessage(`A fresh verification link was dispatched to ${email || "your email"}. Please check your inbox.`);
      setCooldown(60); // 60 seconds strict cooldown
    } catch (err: any) {
      console.error("Resend verification error:", err);
      if (err.code === "auth/too-many-requests") {
        setErrorMessage("Too many requests. Please wait a minute before requesting another email.");
        setCooldown(60);
      } else {
        setErrorMessage("Could not send verification email. Please try again shortly.");
      }
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutFromFirebase();
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/auth/login");
  };

  return (
    <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl border border-slate-200 dark:border-slate-800 rounded-2xl text-center sm:px-10">
      <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
        <MailCheck className="w-7 h-7" />
      </div>

      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
        Verify your email address
      </h2>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
        We sent an official verification link to:
      </p>
      <div className="mt-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 inline-block font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
        {email || "your email address"}
      </div>

      {verified && (
        <div className="mt-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Email successfully verified! Redirecting to dashboard...</span>
        </div>
      )}

      {message && !verified && (
        <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-700 dark:text-blue-300">
          {message}
        </div>
      )}

      {errorMessage && !verified && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 text-left">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!verified && (
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            {checking ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Checking Verification Status...</span>
              </>
            ) : (
              <>
                <span>I Have Verified My Email</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleResendEmail}
            disabled={cooldown > 0 || resending}
            className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {resending
              ? "Sending Verification Link..."
              : cooldown > 0
              ? `Resend available in ${cooldown}s`
              : "Resend Verification Email"}
          </button>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center">
        <button
          type="button"
          onClick={handleLogout}
          className="text-xs text-slate-500 hover:text-rose-500 transition-colors inline-flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out or use a different account</span>
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
            DropAI
          </span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading verification...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
