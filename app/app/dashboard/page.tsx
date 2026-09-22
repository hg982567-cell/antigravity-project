"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDemo } from "@/components/providers/DemoContext";
import { useCurrency } from "@/components/providers/CurrencyContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  Users,
  Percent,
  Sparkles,
  Truck,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  Filter,
  Calendar,
  Layers,
  Store,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function DashboardPage() {
  const { isDemoMode } = useDemo();
  const { formatPrice, currentCurrency } = useCurrency();

  const [dateRange, setDateRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/app/data?type=dashboard&demo=${isDemoMode}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isDemoMode]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const revenue = data?.totalRevenue || 0;
  const profit = data?.totalProfit || 0;
  const ordersCount = data?.ordersCount || 0;
  const aov = data?.avgOrderValue || 0;
  const productsCount = data?.productsCount || 0;

  return (
    <div className="space-y-6">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Executive Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time ecommerce telemetry and AI performance metrics.
          </p>
        </div>

        {/* Date Filter & Quick Actions */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs">
            {["today", "7d", "30d", "90d"].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 rounded-lg font-medium transition-all uppercase text-[11px] ${
                  dateRange === range
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <Link
            href="/app/product-research"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Find Products
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Revenue</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {formatPrice(revenue)}
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>+18.4% vs last period</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Estimated Net Profit</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {formatPrice(profit)}
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>78.4% Gross Margin</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Orders Processed</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {ordersCount}
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                <span>Avg. AOV: </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatPrice(aov)}</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Conversion Rate</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                3.42%
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>+0.6% store checkout</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Financial Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue & Profit SVG Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Sales & Profit Trajectory</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Calculated daily net margins</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="text-slate-600 dark:text-slate-400">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400">Net Profit</span>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* SVG Interactive Chart Bar Representation */}
            <div className="h-60 w-full flex items-end justify-between gap-2 pt-6">
              {[
                { day: "Mon", rev: 1420, prof: 890 },
                { day: "Tue", rev: 2180, prof: 1340 },
                { day: "Wed", rev: 1890, prof: 1120 },
                { day: "Thu", rev: 3240, prof: 2100 },
                { day: "Fri", rev: 2980, prof: 1950 },
                { day: "Sat", rev: 4120, prof: 2780 },
                { day: "Sun", rev: 3840, prof: 2540 },
              ].map((bar) => {
                const revHeight = (bar.rev / 4500) * 100;
                const profHeight = (bar.prof / 4500) * 100;
                return (
                  <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      {/* Revenue bar */}
                      <div
                        style={{ height: `${revHeight}%` }}
                        className="w-full max-w-[24px] bg-blue-600/80 group-hover:bg-blue-600 rounded-t-md transition-all relative"
                      >
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                          {formatPrice(bar.rev)}
                        </span>
                      </div>
                      {/* Profit bar */}
                      <div
                        style={{ height: `${profHeight}%` }}
                        className="w-full max-w-[24px] bg-emerald-500/80 group-hover:bg-emerald-500 rounded-t-md transition-all relative"
                      >
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                          {formatPrice(bar.prof)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">{bar.day}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations & Live Alerts */}
        <div className="space-y-4">
          <Card className="border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/20 dark:from-blue-950/20 dark:to-slate-900">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <CardTitle className="text-sm">AI Opportunity Radar</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Pet Steam Brush</strong> is experiencing an 98% demand surge on TikTok US. Suggested action: Boost ad budget by 20%.
              </p>
              <Link
                href="/app/ads"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Review Campaign in Ads Manager
                <ArrowRight className="w-3 h-3" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  Supplier Status
                </CardTitle>
                <Badge variant="success" size="sm">Optimal</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Zendrop US Direct</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">3.8 days avg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">CJ Dropshipping Air</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">6.2 days avg</span>
              </div>
              <Link
                href="/app/suppliers"
                className="block text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1"
              >
                View Supplier Scorecard →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Orders & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Customer Orders</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Automated fulfillment status</p>
            </div>
            <Link
              href="/app/orders"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View All Orders
              <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-semibold border-y border-slate-200/60 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Order #</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Tracking</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(data?.orders || []).slice(0, 6).map((order: any) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">
                        <Link href={`/app/orders/${order.id}`}>
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {order.customer?.name || "Verified Customer"}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            order.fulfillmentStatus === "DELIVERED"
                              ? "success"
                              : order.fulfillmentStatus === "SHIPPED"
                              ? "info"
                              : "warning"
                          }
                          size="sm"
                        >
                          {order.fulfillmentStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                        {order.shipments?.[0]?.trackingNumber ? (
                          <span className="truncate max-w-[100px] block">
                            {order.shipments[0].trackingNumber}
                          </span>
                        ) : (
                          "Awaiting dispatch"
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/app/orders/${order.id}`}
                          className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Real-Time Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>System Activity Timeline</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Automated events & notifications</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {(data?.notifications || []).map((notif: any) => (
              <div key={notif.id} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{notif.title}</p>
                  <p className="text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Just now</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
