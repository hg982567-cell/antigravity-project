import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Search,
  Truck,
  Zap,
  Palette,
  Shield,
  Bot,
  Globe,
  BarChart3,
  ArrowRight,
  Layers,
  Sparkles,
} from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      icon: Search,
      title: "AI Product Research Radar",
      desc: "5-dimension product scoring: Demand Velocity, Competition Saturation, Net Margin, Trend Momentum, and Supplier Reliability.",
      route: "/app/product-research",
    },
    {
      icon: Truck,
      title: "Verified Supplier Direct Hub",
      desc: "Direct integration with CJ Dropshipping, Zendrop, Spocket, and AliExpress. Auto-fallback routing when primary stock runs low.",
      route: "/app/suppliers",
    },
    {
      icon: Zap,
      title: "Event-Driven Automation Engine",
      desc: "Create deterministic rules: Trigger -> Condition -> AI Decision -> Action -> Immutable Audit Log.",
      route: "/app/automations",
    },
    {
      icon: Palette,
      title: "AI Creative Studio",
      desc: "High-converting ad copy generator, pain-point hooks, and video UGC scripts tailored to your specific product specifications.",
      route: "/app/creative-studio",
    },
    {
      icon: Bot,
      title: "Controlled AI Business Copilot",
      desc: "Natural language query engine with strict 3-tier permission security (READ, WRITE, and user-confirmed HIGH-RISK actions).",
      route: "/app/ai-assistant",
    },
    {
      icon: Globe,
      title: "Centralized Multi-Currency System",
      desc: "Supports USD, EUR, GBP, INR, AED, JPY, CAD, and AUD with dynamic exchange rates and localized formatting.",
      route: "/app/settings",
    },
    {
      icon: Shield,
      title: "Enterprise Security Center",
      desc: "Active session management, remote device logout, 2FA TOTP authentication, rate limiting, and immutable audit trails.",
      route: "/app/security",
    },
    {
      icon: BarChart3,
      title: "Real-Time Profit Analytics",
      desc: "True net profit waterfall after accounting for supplier COGS, shipping rates, ad platform spend, and payment gateway fees.",
      route: "/app/analytics",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16]">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Platform Features
            </span>
            <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              A comprehensive toolkit for serious ecommerce brands
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Explore the modular tools powering modern dropshipping intelligence and automated fulfillment.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{f.title}</h3>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>

                  <Link
                    href={f.route}
                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Open Feature in App
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/app/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md"
            >
              Test All Features in Sandbox
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
