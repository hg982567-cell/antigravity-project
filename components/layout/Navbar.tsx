"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Sparkles, Sun, Moon, Menu, X, ArrowRight, ShieldCheck } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { name: "Features", href: "/features" },
    { name: "Track Order", href: "/track" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
    { name: "Security", href: "/security" },
    { name: "Docs & Help", href: "/help" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-blue-500/30 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="RAVAN SHIPPING"
              className="w-full h-full object-contain p-0.5"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 uppercase">
              RAVAN <span className="text-blue-500">SHIPPING</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                PROD
              </span>
            </span>
            <span className="text-[10px] text-slate-500 -mt-1 font-medium hidden sm:inline">Autonomous Dropshipping &amp; Logistics</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / Theme Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <Link
              href="/app/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:shadow-blue-500/25 active:scale-95"
            >
              Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2"
              >
                Sign In
              </Link>

              <Link
                href="/auth/login?redirect=/app/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:shadow-blue-500/25 active:scale-95"
              >
                Launch Platform
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090d16] px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <Link
              href={user ? "/app/dashboard" : "/auth/login?redirect=/app/dashboard"}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg"
            >
              {user ? "Open Dashboard" : "Sign In & Launch Platform"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
