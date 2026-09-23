import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Cpu, Target, Users, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16]">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              About RAVAN SHIPPING
            </span>
            <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Engineering truth and precision for modern ecommerce
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              We built RAVAN SHIPPING because the dropshipping software landscape was flooded with hype, fake profit claims, and unreliable scraped data. We wanted a real operating system built with software engineering discipline.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Our Core Principle</h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Zero fake metrics. If an integration is disconnected or a supplier is unavailable, we explicitly show you what configuration is needed rather than faking a success screen. Every automation step produces an immutable audit log.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Controlled AI Execution</h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                AI should never have unrestrained, blind access to delete databases or spend advertising budgets. Our AI Brain enforces strict permission tiers (`READ`, `WRITE`, and interactive `HIGH RISK` verification modals).
              </p>
            </div>
          </div>

          <div className="mt-16 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Our Commitments to Merchants</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "No speculative income or profit guarantees",
                "Strict tenant isolation — no other merchant sees your data",
                "Direct API connections without storing raw card credentials",
                "Deterministic automated triggers with fallback safety",
                "Exportable data and transparent invoice auditing",
                "Full support for international currencies and localized sales",
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
