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
  Volume2,
  VolumeX,
  BellRing,
  Package,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useCurrency } from "@/components/providers/CurrencyContext";
import { useDemo } from "@/components/providers/DemoContext";
import { useNotifications } from "@/components/providers/NotificationContext";
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
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);

  const {
    permission,
    soundEnabled,
    notifications,
    unreadCount,
    requestPermission,
    toggleSound,
    triggerTestNotification,
    markAllAsRead,
    markAsRead,
  } = useNotifications();

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          setIsOwner(Boolean(data.isOwner || data.isOwnerAccount || data.user?.role === "OWNER" || data.user?.role === "ADMIN"));
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

        {/* Interactive Notifications Drawer */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationDropdownOpen(!notificationDropdownOpen);
              setStoreDropdownOpen(false);
              setCurrencyDropdownOpen(false);
              setProfileDropdownOpen(false);
            }}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifications & Alerts"
            aria-label="Open Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
              </>
            )}
          </button>

          {notificationDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              {/* Header */}
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Notifications
                  </h3>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                      {unreadCount} New
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">All caught up</span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notification Push & Sound Controls Bar */}
              <div className="p-2.5 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  {/* Push Permission Button / Indicator */}
                  {permission === "granted" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Push Alerts Active
                    </span>
                  ) : (
                    <button
                      onClick={requestPermission}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                      title="Allow browser system push notifications"
                    >
                      <BellRing className="w-3 h-3" />
                      <span>Enable System Push</span>
                    </button>
                  )}

                  {/* Sound Toggle & Test Alert */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={toggleSound}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                        soundEnabled
                          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 shadow-xs"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      }`}
                      title={soundEnabled ? "Sound Alerts Enabled (Click to Mute)" : "Sound Muted (Click to Enable)"}
                    >
                      {soundEnabled ? (
                        <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                      ) : (
                        <VolumeX className="w-3.5 h-3.5" />
                      )}
                      <span className="text-[10px] hidden sm:inline">{soundEnabled ? "Sound ON" : "Muted"}</span>
                    </button>

                    <button
                      onClick={triggerTestNotification}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 transition-colors shadow-xs"
                      title="Play notification chime and send a test system notification"
                    >
                      Test Alert
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => {
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.link) {
                            setNotificationDropdownOpen(false);
                            router.push(n.link);
                          }
                        }}
                        className={`p-3 text-left cursor-pointer transition-colors flex items-start gap-3 ${
                          !n.isRead
                            ? "bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70 dark:hover:bg-blue-950/40"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        {/* Icon */}
                        <div
                          className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                            n.type === "ORDER"
                              ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                              : n.type === "PAYMENT"
                              ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                              : n.type === "ALERT"
                              ? "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400"
                              : n.type === "STOCK"
                              ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
                              : n.type === "SUCCESS"
                              ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {n.type === "ORDER" ? (
                            <Package className="w-3.5 h-3.5" />
                          ) : n.type === "PAYMENT" ? (
                            <CreditCard className="w-3.5 h-3.5" />
                          ) : n.type === "ALERT" || n.type === "STOCK" ? (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          ) : n.type === "SUCCESS" ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {n.title}
                            </p>
                            {!n.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                            {n.time}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-900/50">
                <Link
                  href="/app/notifications"
                  onClick={() => setNotificationDropdownOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline py-1"
                >
                  <span>Open Full Notifications Center</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Light/Dark Theme"
          aria-label="Toggle Light/Dark Theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Owner Admin Quick Launch Button - Strictly visible ONLY to Platform Owner (Requires Password) */}
        {isOwner && (
          <Link
            href="/owner/login?redirect=/owner/dashboard"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-bold transition-all shadow-sm"
            title="RAVAN SHIPPING Owner Super Admin Control Center (Requires Master Password)"
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
                  {isOwner ? "SUPER ADMIN • OWNER" : `${currentUser?.subscription?.plan || "FREE"} Plan • ${currentUser?.subscription?.aiCreditsRemaining?.toLocaleString() || "100"} AI Credits`}
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
                    href="/owner/login?redirect=/owner/dashboard"
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
