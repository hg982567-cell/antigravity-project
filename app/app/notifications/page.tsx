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
} from "lucide-react";

export default function NotificationsPage() {
  const [filter, setFilter] = useState("ALL");
  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      type: "SUCCESS",
      title: "Batch Fulfillment Successful",
      message: "18 orders were successfully dispatched via CJ Dropshipping YunExpress line.",
      link: "/app/orders",
      time: "10 minutes ago",
      isRead: false,
    },
    {
      id: "n2",
      type: "ALERT",
      title: "TikTok Ad Scaling Opportunity",
      message: "UGC Hook 3 for Pet Steam Brush reached a 3.42 ROAS. AI recommends a 20% budget boost.",
      link: "/app/ads",
      time: "1 hour ago",
      isRead: false,
    },
    {
      id: "n3",
      type: "WARNING",
      title: "Supplier Shipping Rate Adjustment",
      message: "USPS regional rate updated for 400g parcels ($3.20 -> $3.50). Margins remain above 78%.",
      link: "/app/suppliers",
      time: "3 hours ago",
      isRead: true,
    },
    {
      id: "n4",
      type: "INFO",
      title: "Security Event Logged",
      message: "Successful merchant session authenticated from Chrome / San Francisco.",
      link: "/app/security",
      time: "Yesterday",
      isRead: true,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const filtered = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.isRead;
    if (filter === "ALERTS") return n.type === "ALERT" || n.type === "WARNING";
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
            className={`p-4 transition-all ${
              !item.isRead ? "border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/10" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    item.type === "SUCCESS"
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40"
                      : item.type === "ALERT"
                      ? "bg-purple-100 text-purple-600 dark:bg-purple-950/40"
                      : item.type === "WARNING"
                      ? "bg-amber-100 text-amber-600 dark:bg-amber-950/40"
                      : "bg-blue-100 text-blue-600 dark:bg-blue-950/40"
                  }`}
                >
                  {item.type === "SUCCESS" && <CheckCircle2 className="w-5 h-5" />}
                  {item.type === "ALERT" && <Sparkles className="w-5 h-5" />}
                  {item.type === "WARNING" && <AlertTriangle className="w-5 h-5" />}
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
