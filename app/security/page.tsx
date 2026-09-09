import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, Lock, Key, Server, FileCheck, CheckCircle2, ArrowRight } from "lucide-react";

export default function SecurityPage() {
  const pillars = [
    {
      icon: Shield,
      title: "Strict Tenant Isolation",
      desc: "Every database query enforces server-side user ownership checks. Users can never view or modify another store's products, orders, or credentials.",
    },
    {
      icon: Lock,
      title: "Zero-Trust Encryption",
      desc: "All traffic is secured via TLS 1.3. Sensitive API secrets and tokens are encrypted at rest using industry-standard AES-256 Galois/Counter Mode.",
    },
    {
      icon: Key,
      title: "Layered Rate Limiting & Auth",
      desc: "Sliding-window rate limits protect all auth endpoints (/api/auth/*) against credential stuffing, brute force, and automated abuse.",
    },
    {
      icon: Server,
      title: "Webhook Signature Verification",
      desc: "Inbound webhooks from Shopify, Stripe, and carriers are verified with cryptographic HMAC-SHA256 signatures before processing.",
    },
    {
      icon: FileCheck,
      title: "Immutable Audit Logs",
      desc: "All critical mutations (logins, order status updates, price changes, AI tool executions) produce tamper-evident audit records.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16]">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Security Architecture
            </span>
            <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Enterprise security built into every layer
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              We never cut corners on data isolation, session verification, or API integrity.
            </p>
          </div>

          <div className="mt-16 space-y-6">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">{p.title}</h2>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 p-8 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Review Your Live Security Posture</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                View active login sessions, manage 2FA, and inspect real-time security events in the app.
              </p>
            </div>
            <Link
              href="/app/security"
              className="shrink-0 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-2"
            >
              Open Security Center
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
