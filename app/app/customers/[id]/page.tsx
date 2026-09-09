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
  User,
  Mail,
  MapPin,
  ShoppingCart,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function CustomerDetailPage() {
  const params = useParams();
  const { isDemoMode } = useDemo();
  const { formatPrice } = useCurrency();

  const [customer, setCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/app/data?type=customers&demo=${isDemoMode}`);
        const data = await res.json();
        const found = (data.customers || []).find((c: any) => c.id === params.id) || data.customers?.[0];
        setCustomer(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, isDemoMode]);

  if (loading || !customer) {
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
        href="/app/customers"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Customers
      </Link>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {customer.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{customer.name}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5" />
              {customer.email} • {customer.city || "Austin"}, {customer.country}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="success" size="md">
            Low Fraud Risk ({customer.riskScore.toFixed(1)})
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Financial Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Lifetime Value</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{formatPrice(customer.totalSpent)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Total Completed Orders</span>
              <span className="font-semibold text-slate-900 dark:text-white">{customer.ordersCount}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Average Order Value</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {formatPrice(customer.ordersCount > 0 ? customer.totalSpent / customer.ordersCount : 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Historical Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 text-xs text-slate-500">
              Customer has <strong>{customer.ordersCount}</strong> verified transactions dispatched via automated supplier lines.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
