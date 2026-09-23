"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  ArrowRight,
  Check,
  BellRing,
  Volume2,
  VolumeX,
  Volume2 as SoundIcon,
  ShieldCheck,
  Package,
  CreditCard,
} from "lucide-react";
import { useNotifications } from "@/components/providers/NotificationContext";

export default function NotificationsPage() {
  const [filter, setFilter] = useState("ALL");
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

  const filtered = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.isRead;
    if (filter === "ALERTS") return n.type === "ALERT" || n.type === "STOCK";
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Notifications & Alerts
            </h1>
            <Badge variant="info" size="sm">
              {notifications.filter((n) => !n.isRead).length} Unread
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time operations notifications, inventory warnings, and advertising opportunities.
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          Mark All as Read
        </button>
      </div>

      {/* Push Notification & Audio Alert Controls Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Real App Push Alerts &amp; Sound Chimes
                </h2>
                {permission === "granted" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Push Active
                  </span>
                ) : permission === "denied" ? (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-[10px] font-bold">
                    Blocked in Browser
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                    Permission Needed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Receive real-time system alerts on your Windows, Mac, or Android device when new customer orders, payments, or stock changes occur. 100% free with offline audio synthesis.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            {permission !== "granted" && (
              <button
                onClick={requestPermission}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Enable Push</span>
              </button>
            )}

            <button
              onClick={toggleSound}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                soundEnabled
                  ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-slate-300 dark:border-slate-700"
                  : "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800"
              }`}
              title={soundEnabled ? "Mute audio chimes" : "Enable audio chimes"}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-blue-500" />
                  <span>Sound ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Sound Muted</span>
                </>
              )}
            </button>

            <button
              onClick={triggerTestNotification}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>Test Alert</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {["ALL", "UNREAD", "ALERTS"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filter === tab
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((item) => (
          <Card
            key={item.id}
            onClick={() => markAsRead(item.id)}
            className={`p-4 transition-all cursor-pointer ${
              !item.isRead ? "border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/10" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    item.type === "ORDER"
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                      : item.type === "PAYMENT"
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                      : item.type === "SUCCESS"
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40"
                      : item.type === "ALERT"
                      ? "bg-purple-100 text-purple-600 dark:bg-purple-950/40"
                      : item.type === "WARNING" || item.type === "STOCK"
                      ? "bg-amber-100 text-amber-600 dark:bg-amber-950/40"
                      : "bg-blue-100 text-blue-600 dark:bg-blue-950/40"
                  }`}
                >
                  {item.type === "ORDER" && <Package className="w-5 h-5" />}
                  {item.type === "PAYMENT" && <CreditCard className="w-5 h-5" />}
                  {item.type === "SUCCESS" && <CheckCircle2 className="w-5 h-5" />}
                  {item.type === "ALERT" && <Sparkles className="w-5 h-5" />}
                  {(item.type === "WARNING" || item.type === "STOCK") && <AlertTriangle className="w-5 h-5" />}
                  {item.type === "INFO" && <Info className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h3>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">{item.time}</span>
                </div>
              </div>

              {item.link && (
                <Link
                  href={item.link}
                  className="shrink-0 p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
