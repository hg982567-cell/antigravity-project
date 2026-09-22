import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Sparkles,
  ArrowRight,
  Search,
  Truck,
  Zap,
  ShoppingCart,
  Megaphone,
  BarChart3,
  Shield,
  CheckCircle2,
  Lock,
  Layers,
  HelpCircle,
  TrendingUp,
  Globe,
  Sliders,
  BookOpen,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const dbPlans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { priceMonthly: "asc" },
  }).catch(() => []);
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16]">
      {/* 1. Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Generation Dropshipping Operating System</span>
            </div>

            {/* Knowledge Base Announcement Banner */}
            <div className="mb-6 flex justify-center">
              <Link
                href="/help"
                className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium hover:border-emerald-400 transition-all shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span><strong>New:</strong> DropAI Knowledge Base &amp; Technical Documentation (42 Guides)</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
              Smarter product research. <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                Autonomous store intelligence.
              </span>
            </h1>

            {/* Subhead with realistic, honest value prop */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              DropAI helps ecommerce operators discover high-demand products, verify supplier fulfillment reliability, automate order routing, and scale ads with structured intelligence.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/app/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Launch Platform
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/features"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-base hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Explore All Capabilities
              </Link>
            </div>

            {/* Honest micro-proof */}
            <p className="mt-4 text-xs text-slate-500">
              No credit card required for sandbox • Connect real stores via secure OAuth
            </p>

            {/* Interactive Preview Mock */}
            <div className="mt-16 max-w-5xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 sm:p-4 shadow-2xl">
              <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0b0f19] p-4 sm:p-6 text-left">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs font-mono text-slate-400 ml-2">dropai.io/app/dashboard</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Live Verified Data
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500">Net Profit Margin</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">78.4%</p>
                    <span className="text-xs text-emerald-600 font-semibold">After shipping & fees</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500">Avg Fulfillment Lead</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">4.2 Days</p>
                    <span className="text-xs text-blue-600 font-semibold">Zendrop US Hub</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500">AI Win Probability</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">94.5 / 100</p>
                    <span className="text-xs text-purple-600 font-semibold">High search velocity</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500">Automations Executed</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">1,420</p>
                    <span className="text-xs text-slate-500 font-semibold">0 manual touches</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Product Explanation */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              How DropAI Works
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              An interconnected operating system for serious merchants
            </p>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Unlike generic Chrome extensions and one-off tools, DropAI unifies market discovery, supplier contracts, automated fulfillment, and ad creation into one secure database.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">1. Real-Time Market Discovery</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Analyze millions of social impressions, Google search volume, and competitor ad spend to surface true untapped demand before markets saturate.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">2. Verified Supplier Intelligence</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Connect directly with vetted CJ, Zendrop, and AliExpress factories. Track historical defect rates, exact warehouse locations, and real transit days.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">3. Autonomous Automations</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Set intelligent triggers that hold fraudulent orders, auto-fallback to secondary warehouses on stock-outs, and synchronize tracking codes back to Shopify.
              </p>
            </div>
          </div>
        </section>

        {/* 4. AI Product Research */}
        <section className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Product Research AI
                </span>
                <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                  Multi-factor product scoring that weeds out the duds
                </h2>
                <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                  Every product is evaluated across 5 core dimensions: search demand, saturation level, gross profit margin, trend slope, and supplier reliability.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    "Zero fabricated sales ranks — backed by actual platform telemetry",
                    "Target specific regions: US, UK, Germany, Canada, Australia, and India",
                    "1-Click import directly to your connected Shopify or WooCommerce store",
                    "Automated margin calculator accounting for shipping, payment fees, and estimated CPA",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <Link
                    href="/app/product-research"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700"
                  >
                    Try Product Research Radar
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Research Radar Visual */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">AI Opportunity Radar</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-semibold">
                    Score: 94.5 / 100
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Market Demand Velocity</span>
                      <span className="font-semibold text-slate-900 dark:text-white">96%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full w-[96%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Gross Profit Potential ($31.49 / unit)</span>
                      <span className="font-semibold text-slate-900 dark:text-white">88%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[88%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Competition Density</span>
                      <span className="font-semibold text-slate-900 dark:text-white">35% (Low)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full w-[35%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Supplier Intelligence */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-4">
                Verified Supplier Benchmarks
              </h4>
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white">Zendrop US Warehouse</p>
                    <p className="text-[11px] text-slate-500">Domestic US Express (3-5 Days)</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">98.5% On-Time</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white">CJ Dropshipping Global</p>
                    <p className="text-[11px] text-slate-500">YunExpress Air Special Line (6-8 Days)</p>
                  </div>
                  <span className="text-xs font-bold text-blue-600">96.2% On-Time</span>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Supplier Intelligence
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                Eliminate fulfillment disasters before they ruin your brand
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                DropAI monitors real supplier inventory fluctuations, warehouse lead times, and carrier delays. If your primary factory runs out of stock, DropAI automatically reroutes orders to an approved alternate.
              </p>
              <div className="mt-6">
                <Link
                  href="/app/suppliers"
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline"
                >
                  View Supplier Directory & Ratings
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Store Automation & 7. Order Automation */}
        <section className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Autonomous Workflows
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              End-to-End Order & Inventory Automation
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              When a customer places an order on your store, DropAI verifies the transaction, checks fraud indicators, passes the details to your verified supplier, and uploads tracking back to the customer automatically.
            </p>
          </div>

          <div className="mt-16 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 px-4">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">STEP 01</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Customer Order</h3>
              <p className="text-xs text-slate-500 mt-2">Captured via secure Shopify/WooCommerce webhook with signature check.</p>
            </div>
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">STEP 02</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Fraud & Stock Audit</h3>
              <p className="text-xs text-slate-500 mt-2">DropAI checks risk score and verifies warehouse inventory levels.</p>
            </div>
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">STEP 03</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Supplier Auto-Dispatch</h3>
              <p className="text-xs text-slate-500 mt-2">Fulfillment payload sent to factory with idempotency key.</p>
            </div>
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">STEP 04</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Tracking Sync</h3>
              <p className="text-xs text-slate-500 mt-2">Carrier milestones synced to store and customer notification triggered.</p>
            </div>
          </div>
        </section>

        {/* 8. AI Advertising & 9. Real-Time Analytics */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Creative Studio & Ad Intelligence
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                Generate high-converting ad angles in seconds
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                Generate Meta and TikTok ad copy, pain-point hooks, and video UGC scripts tailored to your specific product specifications. Real ROAS tracking ensures you know your true profitability after ad spend.
              </p>
              <div className="mt-6">
                <Link
                  href="/app/creative-studio"
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline"
                >
                  Explore Creative Studio
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Multi-Channel Ad ROAS</span>
                <span className="text-xs font-bold text-emerald-600">3.42x Overall ROAS</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">TikTok UGC Hook 3</span>
                  <span className="font-mono text-emerald-600 font-bold">3.42 ROAS ($3,830 Revenue)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Google Search High-Intent</span>
                  <span className="font-mono text-emerald-600 font-bold">3.15 ROAS ($2,897 Revenue)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Meta TOF Reels Angle</span>
                  <span className="font-mono text-emerald-600 font-bold">2.85 ROAS ($5,245 Revenue)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 10. Security & 11. Supported Integrations */}
        <section className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Ecosystem & Security
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                Enterprise integrations with zero-trust security
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300">
                Direct OAuth 2.0 PKCE connections with leading ecommerce platforms, verified dropship hubs, and advertising networks.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
              {["Shopify", "WooCommerce", "AliExpress", "CJ Dropship", "Zendrop", "Spocket", "Meta Ads", "Google Ads", "TikTok Ads", "Stripe", "USPS", "DHL Express"].map((integ) => (
                <div key={integ} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-xs text-slate-800 dark:text-slate-200 shadow-xs">
                  {integ}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 12. Transparent Pricing */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Transparent Pricing
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Predictable plans with zero hidden fees
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              No revenue percentage cuts. You keep 100% of your store margins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dbPlans && dbPlans.length > 0 ? (
              dbPlans
                .filter((p: any) => p.code !== "FREE")
                .slice(0, 3)
                .map((p: any) => {
                  const isPro = p.code === "PRO";
                  return (
                    <div
                      key={p.id}
                      className={`p-8 rounded-2xl bg-white dark:bg-slate-900 flex flex-col justify-between relative shadow-xl transition-all ${
                        isPro
                          ? "border-2 border-blue-600 dark:border-blue-500"
                          : "border border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      {isPro && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
                          Most Popular
                        </span>
                      )}
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{p.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {isPro ? "For scaling stores with active ad spend" : p.code === "STARTER" ? "For new merchants testing products" : "For enterprise volume & dedicated capacity"}
                        </p>
                        <div className="mt-6 flex items-baseline gap-1">
                          <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                            ${p.priceMonthly}
                          </span>
                          <span className="text-xs text-slate-500">/ month</span>
                        </div>
                        <ul className="mt-6 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                          <li className="flex items-center gap-2">✓ {p.storeLimit} Connected Store{p.storeLimit > 1 ? "s" : ""}</li>
                          <li className="flex items-center gap-2">✓ {p.aiCreditsLimit.toLocaleString()} AI Credits / mo</li>
                          <li className="flex items-center gap-2">✓ {p.orderLimit.toLocaleString()} Automated Orders</li>
                          <li className="flex items-center gap-2">✓ {p.productLimit.toLocaleString()} Catalog Limit</li>
                          <li className="flex items-center gap-2">✓ {p.supportLevel || "Standard"} Support</li>
                        </ul>
                      </div>
                      <Link
                        href="/auth/signup"
                        className={`mt-8 w-full block text-center py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isPro
                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                            : "border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        {isPro ? "Launch Pro Platform" : `Start with ${p.name}`}
                      </Link>
                    </div>
                  );
                })
            ) : (
              <>
                <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Starter</h3>
                    <p className="text-xs text-slate-500 mt-1">For new merchants testing their first product</p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$29</span>
                      <span className="text-xs text-slate-500">/ month</span>
                    </div>
                    <ul className="mt-6 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                      <li className="flex items-center gap-2">✓ 1 Connected Store</li>
                      <li className="flex items-center gap-2">✓ 50 AI Product Searches / mo</li>
                      <li className="flex items-center gap-2">✓ 200 Automated Orders</li>
                    </ul>
                  </div>
                  <Link href="/app/dashboard" className="mt-8 w-full block text-center py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                    Start with Starter
                  </Link>
                </div>
                <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-500 flex flex-col justify-between relative shadow-xl">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">Most Popular</span>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Pro Merchant</h3>
                    <p className="text-xs text-slate-500 mt-1">For scaling stores with active ad spend</p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$79</span>
                      <span className="text-xs text-slate-500">/ month</span>
                    </div>
                  </div>
                  <Link href="/app/dashboard" className="mt-8 w-full block text-center py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-md">Launch Pro Platform</Link>
                </div>
                <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Scale Enterprise</h3>
                    <p className="text-xs text-slate-500 mt-1">For 7-figure brands requiring custom SLAs</p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$199</span>
                      <span className="text-xs text-slate-500">/ month</span>
                    </div>
                  </div>
                  <Link href="/contact" className="mt-8 w-full block text-center py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">Contact Enterprise Sales</Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* 12b. Documentation & Knowledge Base Showcase */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              DropAI Knowledge Base
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Production Documentation &amp; Technical Guides
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              42 comprehensive, production-grade technical articles across 10 categories. Learn how our multi-tenant database, 3-tier AI permissions, Shopify OAuth PKCE, and real order routing work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Getting Started & Core Concepts",
                count: "5 Articles",
                desc: "Architecture overview, Quickstart walkthrough, Currency engine with USD base, and live store activation.",
                href: "/help/category/getting-started",
              },
              {
                title: "Shopify Integration & OAuth PKCE",
                count: "4 Articles",
                desc: "Official OAuth 2.0 PKCE handshake, webhook signatures, catalog sync, and zero-token exposure.",
                href: "/help/category/shopify-integration",
              },
              {
                title: "Database & Multi-Tenant Security",
                count: "4 Articles",
                desc: "Neon PostgreSQL row-level isolation, encrypted credentials, JWT httpOnly cookies, and audit logging.",
                href: "/help/category/security-compliance",
              },
              {
                title: "AI Engine & 3-Tier Permissions",
                count: "5 Articles",
                desc: "Safe read/write/high-risk action boundaries, Gemini 3.6 Flash integration, and zero-hallucination tools.",
                href: "/help/category/ai-assistant",
              },
              {
                title: "Real Order & Supplier Routing",
                count: "4 Articles",
                desc: "Automated fulfillment via Zendrop, AliExpress, CJ Dropshipping APIs, and tracking sync.",
                href: "/help/category/order-fulfillment",
              },
              {
                title: "Owner Command Center",
                count: "4 Articles",
                desc: "Platform administration, real-time metrics, role-based access control, and documentation CMS.",
                href: "/help/category/platform-admin",
              },
            ].map((cat, idx) => (
              <Link
                key={idx}
                href={cat.href}
                className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    {cat.count}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {cat.title}
                </h3>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {cat.desc}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/help"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse All 42 Technical Guides in Help Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* 13. FAQ */}
        <section className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Frequently Asked Questions
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
                Clear answers for ecommerce operators
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Does DropAI guarantee store profits or sales?",
                  a: "No. Anyone promising guaranteed profits in ecommerce is misleading you. DropAI provides rigorous data intelligence, supplier verification, and automated workflows so you make informed decisions with higher statistical probability of success.",
                },
                {
                  q: "How does the AI Assistant execute actions?",
                  a: "DropAI uses a 3-tier permission model. READ actions (like querying orders or analytics) execute immediately. WRITE actions (like drafting a product listing) create drafts. HIGH RISK actions (like cancelling orders or deleting catalog items) require your explicit confirmation in an interactive modal.",
                },
                {
                  q: "How do store connections work?",
                  a: "DropAI connects via official OAuth 2.0 PKCE with Shopify, WooCommerce, BigCommerce, and custom webhook endpoints. Your customer data is strictly isolated to your user tenancy.",
                },
                {
                  q: "Can I test the platform before connecting my live store?",
                  a: "Yes! DropAI features an integrated Demo Mode with rich sample products, orders, and supplier data so you can test every workflow before connecting real store credentials.",
                },
              ].map((faq, idx) => (
                <div key={idx} className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">{faq.q}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 14. Final CTA */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white shadow-2xl relative overflow-hidden">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Ready to automate your dropshipping operations?
            </h2>
            <p className="mt-4 text-blue-100 max-w-xl mx-auto text-base">
              Experience the power of real data, vetted suppliers, and zero-hallucination ecommerce workflows today.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/app/dashboard"
                className="px-8 py-3.5 rounded-xl bg-white text-blue-600 font-bold text-sm shadow-md hover:bg-blue-50 transition-colors"
              >
                Launch Platform
              </Link>
              <Link
                href="/app/dashboard"
                className="px-8 py-3.5 rounded-xl border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                Explore Live Storefronts
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 15. Footer */}
      <Footer />
    </div>
  );
}
