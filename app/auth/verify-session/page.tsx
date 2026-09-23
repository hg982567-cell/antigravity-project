"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function VerifySessionPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Validating cryptographic session token...");

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.authenticated) {
          setStatus("Session verified. Redirecting to your dashboard...");
          const target = "/app/dashboard";
          setTimeout(() => {
            router.replace(target);
          }, 600);
        } else {
          setStatus("Session expired. Redirecting to sign in...");
          setTimeout(() => {
            router.replace("/auth/login");
          }, 800);
        }
      } catch {
        router.replace("/auth/login");
      }
    }
    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm w-full text-center">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Verifying Identity</h2>
        <p className="mt-2 text-xs text-slate-500">{status}</p>
      </div>
    </div>
  );
}
