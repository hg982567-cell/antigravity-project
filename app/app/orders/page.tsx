"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDemo } from "@/components/providers/DemoContext";
import { useCurrency } from "@/components/providers/CurrencyContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  ShoppingCart,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function OrdersPage() {
  const { isDemoMode } = useDemo();
  const { formatPrice } = useCurrency();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/app/data?type=orders&demo=${isDemoMode}`);
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isDemoMode]);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || o.fulfillmentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Order Fulfillment Hub
            </h1>
            <span className="text-xs text-slate-500 font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
              {orders.length} Total Orders
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time supplier dispatch, automated tracking sync, and fraud score protection.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["ALL", "UNFULFILLED", "PROCESSING", "SHIPPED", "DELIVERED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200/60 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Order Number</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Total Charged</th>
                  <th className="px-4 py-3">Net Profit</th>
                  <th className="px-4 py-3">Fulfillment Status</th>
                  <th className="px-4 py-3">Carrier & Tracking</th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">
                      <Link href={`/app/orders/${order.id}`}>
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200">
                      <div>
                        <p className="font-semibold">{order.customer?.name || "Customer"}</p>
                        <p className="text-[10px] text-slate-400">{order.customer?.country || "US"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-white">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-emerald-600">
                      +{formatPrice(order.profitAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          order.fulfillmentStatus === "DELIVERED"
                            ? "success"
                            : order.fulfillmentStatus === "SHIPPED"
                            ? "info"
                            : order.fulfillmentStatus === "PROCESSING"
                            ? "purple"
                            : "warning"
                        }
                        size="sm"
                      >
                        {order.fulfillmentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {order.shipments?.[0]?.trackingNumber ? (
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {order.shipments[0].carrier}:
                          </span>{" "}
                          <span>{order.shipments[0].trackingNumber}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Pending supplier dispatch</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/app/orders/${order.id}`}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        View
                        <ArrowRight className="w-3 h-3" />
                      </Link>
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
