import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HelpCircle, BookOpen, Terminal, Sparkles, ArrowRight } from "lucide-react";

export default function HelpPage() {
  const articles = [
    {
      category: "Getting Started",
      items: [
        "How to connect your Shopify store using official OAuth PKCE",
        "Configuring your base currency vs display currency",
        "Importing your first winning product from the research radar",
        "Understanding Drop AI Brain tool permissions",
      ],
    },
    {
      category: "Automations & Fulfillment",
      items: [
        "Setting up low inventory supplier auto-fallback rules",
        "How fraud risk scores hold high-risk orders automatically",
        "Carrier tracking sync: supported lines (USPS, YunExpress, DHL)",
        "Handling partial returns and supplier disputes",
      ],
    },
    {
      category: "Security & Account",
      items: [
        "Enabling Two-Factor Authentication (TOTP) with Google Authenticator",
        "Reviewing and revoking active device login sessions",
        "Rotating API secrets and webhook HMAC signing keys",
        "Understanding data isolation in our multi-tenant database",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16]">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Documentation & Knowledge Base
            </span>
            <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              How can we help your store?
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Browse technical guides, integration tutorials, and best practices for scaling with DropAI.
            </p>
          </div>

          <div className="mt-16 space-y-12">
            {articles.map((section, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  {section.category}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {section.items.map((item, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <span>{item}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center p-8 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Need personal assistance?</h3>
            <p className="text-xs text-slate-500 mt-1">Our technical specialists are available around the clock.</p>
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700"
            >
              Open Support Ticket
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
