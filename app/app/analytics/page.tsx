"use client";

import React, { useState, useEffect } from "react";
import { useDemo } from "@/components/providers/DemoContext";
import { useCurrency } from "@/components/providers/CurrencyContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Globe,
  ShoppingCart,
  Percent,
  Calendar,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export default function AnalyticsPage() {
  const { isDemoMode } = useDemo();
  const { formatPrice } = useCurrency();
  const [timeRange, setTimeRange] = useState("30d");

  const countryBreakdown = [
    { country: "United States", flag: "🇺🇸", share: "64%", revenue: 12450 },
    { country: "United Kingdom", flag: "🇬🇧", share: "18%", revenue: 3500 },
    { country: "Germany & EU", flag: "🇩🇪", share: "11%", revenue: 2140 },
    { country: "Canada", flag: "🇨🇦", share: "7%", revenue: 1360 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Business Intelligence & Analytics
            </h1>
            <Badge variant="purple" size="sm">
              <Sparkles className="w-3 h-3 mr-1" />
              PROFIT WATERFALL
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            True net profit accounting with factory COGS, ad spend, and gateway transaction fees.
          </p>
        </div>

        <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs">
          {["7d", "30d", "90d", "1y"].map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-lg font-medium transition-all uppercase text-[11px] ${
                timeRange === r
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* P&L Waterfall Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500">Gross Sales</p>
            <h3 className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              {formatPrice(19450)}
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">+14.2% trajectory</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500">Total Supplier COGS</p>
            <h3 className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              {formatPrice(4820)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">24.7% of gross revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500">Total Paid Ad Spend</p>
            <h3 className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              {formatPrice(3880)}
            </h3>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">Blended 5.01x ROAS</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/20">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Estimated Net Profit</p>
            <h3 className="text-2xl font-bold font-mono text-emerald-600 mt-1">
              {formatPrice(10750)}
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">55.2% Net Take-Home</p>
          </CardContent>
        </Card>
      </div>

      {/* Country Revenue Breakdown & Sales Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Revenue by Destination Region</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0 text-xs">
            {countryBreakdown.map((cb) => (
              <div key={cb.country} className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
                  <span className="flex items-center gap-1.5">
                    <span>{cb.flag}</span>
                    <span>{cb.country}</span>
                  </span>
                  <span className="font-mono">{formatPrice(cb.revenue)} ({cb.share})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div style={{ width: cb.share }} className="h-full bg-blue-600 rounded-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">AI Predictive 30-Day Forecast</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50">
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                Estimated Prediction (Not a guarantee)
              </span>
              <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                Based on active ad conversion trends and seasonal search interest, revenue is modeled to reach <strong>{formatPrice(28400)}</strong> over the next 30 days if ad spend scales proportionally by 15%.
              </p>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              * Note: Forecasts are algorithmic simulations and subject to macroeconomic ad auction volatility.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
