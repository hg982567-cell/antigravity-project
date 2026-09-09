"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Starter",
      description: "For new merchants validating their first dropshipping offer.",
      priceMonthly: 29,
      priceYearly: 24,
      features: [
        "1 Connected Store (Shopify / WooCommerce)",
        "50 AI Product Radar searches/mo",
        "200 Automated orders/mo",
        "Direct CJ & AliExpress routing",
        "Email support (24-hour response)",
      ],
      cta: "Start 14-Day Trial",
      popular: false,
    },
    {
      name: "Pro Merchant",
      description: "For scaling brands running multi-channel ads and automated fulfillment.",
      priceMonthly: 79,
      priceYearly: 64,
      features: [
        "5 Connected Stores",
        "Unlimited AI Product Radar searches",
        "5,000 Automated orders/mo",
        "Supplier Auto-Fallback & Fraud Guard",
        "AI Creative Studio & Ad Copywriter",
        "Centralized Multi-Currency Intelligence",
        "Priority 24/7 Merchant Support",
      ],
      cta: "Get Started with Pro",
      popular: true,
    },
    {
      name: "Scale Enterprise",
      description: "For high-volume ecommerce groups needing dedicated infrastructure.",
      priceMonthly: 199,
      priceYearly: 159,
      features: [
        "Unlimited Connected Stores",
        "Unlimited Automated orders",
        "Dedicated High-Speed Webhook Workers",
        "Custom 3PL & Warehouse Integration",
        "Role-Based Access Control (RBAC)",
        "Immutable Audit Log Export (SOC2 Ready)",
        "Dedicated Account Executive",
      ],
      cta: "Contact Enterprise",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16]">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Transparent Pricing
            </span>
            <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Invest in precision, not hollow promises
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              No revenue cuts, no surprise usage penalties. Every plan includes full access to the Drop AI Brain.
            </p>

            {/* Billing Toggle */}
            <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  billingCycle === "yearly"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Annual Billing
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((p) => {
              const price = billingCycle === "yearly" ? p.priceYearly : p.priceMonthly;
              return (
                <div
                  key={p.name}
                  className={`p-8 rounded-2xl bg-white dark:bg-slate-900 border flex flex-col justify-between relative transition-all ${
                    p.popular
                      ? "border-2 border-blue-600 dark:border-blue-500 shadow-xl"
                      : "border-slate-200 dark:border-slate-800 shadow-sm"
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
                      Most Popular
                    </span>
                  )}

                  <div>
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">{p.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{p.description}</p>

                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-slate-900 dark:text-white">${price}</span>
                      <span className="text-xs text-slate-500">/ month</span>
                    </div>
                    {billingCycle === "yearly" && (
                      <p className="text-[11px] text-emerald-600 font-semibold mt-1">Billed annually (${price * 12}/yr)</p>
                    )}

                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      {p.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href="/app/dashboard"
                    className={`mt-8 w-full block text-center py-3 rounded-xl text-xs font-semibold transition-all ${
                      p.popular
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25"
                        : "border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {p.cta}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
