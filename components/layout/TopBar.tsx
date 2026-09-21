"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bot,
  Bell,
  Store,
  Globe,
  Sun,
  Moon,
  Menu,
  ChevronDown,
  User,
  Shield,
  LogOut,
  ExternalLink,
  Check,
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useCurrency } from "@/components/providers/CurrencyContext";
import { useDemo } from "@/components/providers/DemoContext";
import { signOutFromFirebase } from "@/lib/firebase/client";

interface TopBarProps {
  setMobileOpen: (open: boolean) => void;
}

export function TopBar({ setMobileOpen }: TopBarProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { currentCurrency, setCurrency, availableCurrencies } = useCurrency();
  const { activeStore, setActiveStore } = useDemo();

  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          setIsOwner(data.isOwner || data.user.role === "OWNER");
        }
      })
      .catch(() => null);
  }, []);

  const stores = [
    { id: "store_1", name: "Apex Living USA", platform: "Shopify (US)", isConnected: true },
    { id: "store_2", name: "Nordic Haven EU", platform: "WooCommerce (DE)", isConnected: true },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/app/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    setProfileDropdownOpen(false);
    try {
      await signOutFromFirebase();
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders, products, SKUs, suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800/60 border border-transparent dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Store Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setStoreDropdownOpen(!storeDropdownOpen);
              setCurrencyDropdownOpen(false);
              setProfileDropdownOpen(false);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline max-w-[120px] truncate">{activeStore.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {storeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-50">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Select Store
              </div>
              {stores.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveStore(s);
                    setStoreDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-[10px] text-slate-400">{s.platform}</p>
                  </div>
                  {activeStore.id === s.id && <Check className="w-4 h-4 text-blue-500" />}
                </button>
              ))}
              <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                <Link
                  href="/app/stores"
                  onClick={() => setStoreDropdownOpen(false)}
                  className="px-3 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline block"
                >
                  + Connect New Store
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Centralized Currency Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setCurrencyDropdownOpen(!currencyDropdownOpen);
              setStoreDropdownOpen(false);
              setProfileDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Change display currency"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">{currentCurrency}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {currencyDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-50 max-h-60 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Display Currency
              </div>
              {availableCurrencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.code);
                    setCurrencyDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <span className="flex items-center gap-2">
                    <span>{c.flag}</span>
                    <span>{c.code} ({c.symbol})</span>
                  </span>
                  {currentCurrency === c.code && <Check className="w-3.5 h-3.5 text-blue-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick AI Assistant Trigger */}
        <Link
          href="/app/ai-assistant"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs font-semibold transition-all"
          title="Open AI Assistant Copilot"
        >
          <Bot className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Ask AI</span>
        </Link>

        {/* Notifications Icon */}
        <Link
          href="/app/notifications"
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Light/Dark Theme"
          aria-label="Toggle Light/Dark Theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Owner Admin Quick Launch Button - Strictly visible ONLY to Platform Owner */}
        {isOwner && (
          <Link
            href="/owner/dashboard"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-bold transition-all shadow-sm"
            title="DropAI Owner Super Admin Control Center"
          >
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Owner Admin</span>
          </Link>
        )}

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setStoreDropdownOpen(false);
              setCurrencyDropdownOpen(false);
            }}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-500/20 transition-all"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-sm ${isOwner ? "bg-gradient-to-tr from-amber-600 to-orange-500" : "bg-gradient-to-tr from-blue-600 to-indigo-500"}`}>
              {isOwner ? "OW" : (currentUser?.name?.substring(0, 2).toUpperCase() || "AR")}
            </div>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  {currentUser?.name || "Alex Rivera"}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {currentUser?.email || "demo@dropai.io"}
                </p>
                <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${isOwner ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"}`}>
                  {isOwner ? "SUPER ADMIN • OWNER" : `${currentUser?.subscription?.plan || "PRO"} Plan • ${currentUser?.subscription?.aiCreditsRemaining?.toLocaleString() || "4,820"} AI Credits`}
                </span>
              </div>

              <div className="py-1">
                <Link
                  href="/app/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Account Profile
                </Link>
                <Link
                  href="/app/security"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  Security Center
                </Link>
                <Link
                  href="/app/billing"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Billing & Credits
                </Link>
              </div>

              {/* Owner Gateway Link - ONLY VISIBLE IF CURRENT USER IS ACTUALLY AN OWNER */}
              {isOwner && (
                <div className="border-t border-slate-100 dark:border-slate-800 py-1 bg-amber-500/5">
                  <Link
                    href="/owner/dashboard"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center justify-between px-4 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-amber-500" />
                      <span>Owner Control Center</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black">
                      ROOT
                    </span>
                  </Link>
                </div>
              )}

              <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-left transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
