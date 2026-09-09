"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDemo } from "@/components/providers/DemoContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Truck,
  Star,
  Clock,
  ShieldCheck,
  Search,
  ExternalLink,
  ArrowRight,
  MapPin,
  CheckCircle2,
} from "lucide-react";

export default function SuppliersPage() {
  const { isDemoMode } = useDemo();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/app/data?type=suppliers&demo=${isDemoMode}`);
        const data = await res.json();
        setSuppliers(data.suppliers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isDemoMode]);

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.platform.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Supplier Directory & Intelligence
            </h1>
            <Badge variant="success" size="sm">
              <ShieldCheck className="w-3 h-3 mr-1" />
              VERIFIED FACTORIES
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time fulfillment benchmarks, delivery speeds, defect rates, and automated routing lines.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search suppliers or platforms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((sup) => (
          <Card key={sup.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {sup.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <CardTitle className="text-base">{sup.name}</CardTitle>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    Country Origin: {sup.country} • {sup.platform}
                  </p>
                </div>
              </div>

              <Badge variant="success" size="md">
                <Star className="w-3 h-3 mr-1 fill-emerald-500 text-emerald-500" />
                {sup.rating.toFixed(1)} Rating
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center text-xs">
                <div>
                  <p className="text-[10px] text-slate-400">Reliability</p>
                  <p className="font-bold text-emerald-600 font-mono mt-0.5">{sup.reliabilityScore}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Avg Lead Time</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">{sup.fulfillmentSpeedDays} Days</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Orders Fulfilled</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">{sup.totalOrdersFulfilled.toLocaleString()}</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <p><strong>Return Guarantee:</strong> {sup.returnPolicy}</p>
                <p><strong>Direct Contact:</strong> {sup.contactEmail || "api-gateway@supplier.com"}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> API Sync Active
                </span>
                <Link
                  href={`/app/suppliers/${sup.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Profile & Warehouses
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
