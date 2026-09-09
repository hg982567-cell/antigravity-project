"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "merchant@store.com";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleCodeChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);

    if (val && index < 5) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length === 6) {
      setVerifying(true);
      setTimeout(() => {
        setVerifying(false);
        setSuccess(true);
        setTimeout(() => {
          router.push("/app/dashboard");
        }, 1200);
      }, 800);
    }
  };

  const handleResend = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl border border-slate-200 dark:border-slate-800 rounded-2xl text-center sm:px-10">
      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mx-auto mb-4">
        <MailCheck className="w-6 h-6" />
      </div>

      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verify your email address</h2>
      <p className="mt-2 text-xs text-slate-500 max-w-xs mx-auto">
        We sent a 6-digit confirmation code to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>.
      </p>

      {success ? (
        <div className="mt-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Email verified successfully! Redirecting to dashboard...</span>
        </div>
      ) : (
        <form onSubmit={handleVerify} className="mt-6 space-y-6">
          <div className="flex justify-center gap-2">
            {code.map((digit, idx) => (
              <input
                key={idx}
                id={`digit-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(idx, e.target.value)}
                className="w-11 h-12 text-center font-mono text-lg font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={code.join("").length < 6 || verifying}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            {verifying ? "Verifying Code..." : "Confirm Code & Continue"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <span>Didn&apos;t receive email?</span>
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline disabled:opacity-50"
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading verification...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
