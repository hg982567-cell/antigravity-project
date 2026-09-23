import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16]">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Terms of Service
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-500 mt-2">Effective: September 2026</p>

          <div className="mt-8 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">1. Acceptance of Terms</h2>
              <p>
                By registering for or using RAVAN SHIPPING, you agree to comply with these terms, our acceptable use guidelines, and all applicable international trade and advertising laws.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">2. Realistic Disclaimers & Merchant Responsibility</h2>
              <p>
                RAVAN SHIPPING provides software automation and market intelligence. We make no guarantees regarding business profitability, sales volume, or ad performance. You remain exclusively responsible for compliance with regional consumer protection laws, product warranties, and truthful advertising on Meta, Google, and TikTok.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">3. Prohibited Uses</h2>
              <p>
                You may not utilize RAVAN SHIPPING to sell counterfeit goods, illicit substances, weapons, or misleading health products, or attempt to reverse-engineer our proprietary scoring models and automated webhook handlers.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">4. Subscription Billing & Cancellation</h2>
              <p>
                Subscriptions are billed on a recurring monthly or annual basis. You may cancel your subscription at any time within your Billing Settings. Access continues through the end of the paid billing cycle without refund of partial months.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
