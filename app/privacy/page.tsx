import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16]">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Legal & Compliance
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500 mt-2">Last updated: September 2026</p>

          <div className="mt-8 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">1. Data Ownership & Tenant Isolation</h2>
              <p>
                RAVAN SHIPPING strictly operates on a single-tenant data isolation principle within our relational database layer. Your customer orders, product catalogs, supplier configurations, and advertising metrics are protected by server-side tenancy verification. We do not sell or share your store data with third-party advertisers or competing merchants.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">2. Information We Collect</h2>
              <p>
                We collect your account email, encrypted credentials, billing information through PCI-compliant gateways (Stripe), and store integration metadata (Shopify/WooCommerce tokens) required to execute fulfillment automations on your behalf.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">3. RAVAN SHIPPING AI Security & Tool Calls</h2>
              <p>
                Our AI processing layer operates through controlled, permission-gated tools. Your sensitive store secrets, raw payment numbers, and cryptographic keys are never passed to external AI models. All tool executions are logged immutably in your security audit trail.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">4. Your Data Rights (GDPR & CCPA)</h2>
              <p>
                You retain full rights to request data export, anonymization, or permanent deletion of your account and all associated store connections at any time via your Security Center or by contacting privacy@ravanshipping.com.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
