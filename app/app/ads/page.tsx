"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDemo } from "@/components/providers/DemoContext";
import { useCurrency } from "@/components/providers/CurrencyContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Megaphone,
  TrendingUp,
  DollarSign,
  MousePointerClick,
  Sparkles,
  ArrowRight,
  BarChart2,
  ExternalLink,
} from "lucide-react";

export default function AdsManagerPage() {
  const { isDemoMode } = useDemo();
  const { formatPrice } = useCurrency();

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/app/data?type=ads&demo=${isDemoMode}`);
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isDemoMode]);

  const totalSpend = campaigns.reduce((acc, c) => acc + c.totalSpend, 0);
  const totalRev = campaigns.reduce((acc, c) => acc + c.revenue, 0);
  const avgRoas = totalSpend > 0 ? (totalRev / totalSpend).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Ad Intelligence & ROAS Manager
            </h1>
            <Badge variant="purple" size="sm">
              <Sparkles className="w-3 h-3 mr-1" />
              MULTI-CHANNEL ATTRIBUTION
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real performance telemetry aggregated from Meta Ads, TikTok Ads, and Google Search.
          </p>
        </div>

        <Link
          href="/app/creative-studio"
          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Creative Studio
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Ad Spend</p>
              <h3 className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {formatPrice(totalSpend)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Across 3 live campaigns</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Attributed Ad Revenue</p>
              <h3 className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {formatPrice(totalRev)}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Verified pixel purchases</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Blended ROAS</p>
              <h3 className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                {avgRoas}x
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Return on Ad Spend</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
              <BarChart2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Ad Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200/60 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3">Campaign Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Daily Budget</th>
                  <th className="px-4 py-3">Total Spend</th>
                  <th className="px-4 py-3">Conversions</th>
                  <th className="px-4 py-3">ROAS</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase">
                        {camp.platform}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {camp.campaignName}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="success" size="sm">
                        {camp.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {formatPrice(camp.dailyBudget)} / day
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                      {formatPrice(camp.totalSpend)}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold">
                      {camp.conversions} orders
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-600">
                      {camp.roas.toFixed(2)}x
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white text-right">
                      {formatPrice(camp.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
