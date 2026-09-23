import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16]">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Cookie Transparency
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Cookie Policy & Preferences
          </h1>
          <p className="text-xs text-slate-500 mt-2">Effective: September 2026</p>

          <div className="mt-8 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">1. Essential Authentication Cookies</h2>
              <p>
                RAVAN SHIPPING utilizes secure, HttpOnly, SameSite cookies (`dropai_session_token`) strictly required for authenticating your user session, preventing cross-site request forgery (CSRF), and securing multi-factor authentication states. These cannot be disabled.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">2. Functional Preference Storage</h2>
              <p>
                We use browser localStorage to maintain your UI preferences: Light/Dark theme selection, preferred display currency (USD, EUR, GBP, INR, AED, JPY), and your active store workspace filter.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">3. Zero Third-Party Tracking Cookies</h2>
              <p>
                RAVAN SHIPPING does not sell your browsing behavior or use intrusive cross-site ad retargeting cookies within your merchant dashboard.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
