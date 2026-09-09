"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDemo } from "@/components/providers/DemoContext";
import { useCurrency } from "@/components/providers/CurrencyContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  Star,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Package,
} from "lucide-react";

export default function SupplierDetailPage() {
  const params = useParams();
  const { isDemoMode } = useDemo();
  const { formatPrice } = useCurrency();

  const [supplier, setSupplier] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/app/data?type=suppliers&demo=${isDemoMode}`);
        const data = await res.json();
        const found = (data.suppliers || []).find((s: any) => s.id === params.id) || data.suppliers?.[0];
        setSupplier(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, isDemoMode]);

  if (loading || !supplier) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link
        href="/app/suppliers"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Suppliers
      </Link>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-blue-500/20">
            {supplier.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{supplier.name}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              HQ: {supplier.country} • Platform: {supplier.platform} • Contact: {supplier.contactEmail}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="success" size="md">
            <Star className="w-3.5 h-3.5 mr-1 fill-emerald-500 text-emerald-500" />
            {supplier.rating.toFixed(1)} / 5.0
          </Badge>
          <Badge variant="purple" size="md">
            {supplier.reliabilityScore}% Reliability
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Warehouse Locations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">US East Hub (NJ)</p>
                <p className="text-[11px] text-slate-500">USPS Priority (2-4 Days)</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-600">Active</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Shenzhen Global Depot</p>
                <p className="text-[11px] text-slate-500">YunExpress Air (6-8 Days)</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-600">Active</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Fulfillment Policy & SLA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <p><strong>Replacement Guarantee:</strong> {supplier.returnPolicy}</p>
            <p><strong>Dispute Resolution:</strong> Automated claim submission supported via DropAI webhook integration. Damaged goods re-dispatched within 24 hours.</p>
            <p><strong>Total Historical Orders Fulfilled:</strong> {supplier.totalOrdersFulfilled.toLocaleString()} units with 0.4% recorded defect rate.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
