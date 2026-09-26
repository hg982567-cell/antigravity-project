import React from "react";
import Link from "next/link";
import { Sparkles, Shield, Lock, CheckCircle2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070a11] text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-900 border border-blue-500/30 flex items-center justify-center p-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="RAVAN SHIPPING" className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white uppercase">
                RAVAN <span className="text-blue-500">SHIPPING</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Enterprise dropshipping automation and intelligence platform. Built with real integrations, verified suppliers, strict data security, and zero hallucinated revenue.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                Zero-Trust Auth
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-500" />
                256-bit Encryption
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Product Research
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Supplier Intelligence
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Store Automations
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Creative Studio
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Support */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3">
              Resources
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Help Center & Docs
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Security Architecture
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Cookie Preferences
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} RAVAN SHIPPING Inc. All rights reserved. RAVAN SHIPPING does not make speculative profit guarantees.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
