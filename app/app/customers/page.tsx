"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDemo } from "@/components/providers/DemoContext";
import { useCurrency } from "@/components/providers/CurrencyContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users, Search, ArrowRight, ShieldCheck, MapPin } from "lucide-react";

export default function CustomersPage() {
  const { isDemoMode } = useDemo();
  const { formatPrice } = useCurrency();

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/app/data?type=customers&demo=${isDemoMode}`);
        const data = await res.json();
        setCustomers(data.customers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isDemoMode]);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Customer Intelligence
            </h1>
            <span className="text-xs text-slate-500 font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
              {customers.length} Customers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track customer lifetime value (LTV), repeat purchase frequency, and fraud indicators.
          </p>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200/60 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Orders Count</th>
                  <th className="px-4 py-3">Lifetime Spend</th>
                  <th className="px-4 py-3">Fraud Risk</th>
                  <th className="px-4 py-3 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      <Link href={`/app/customers/${cust.id}`}>
                        {cust.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono">
                      {cust.email}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {cust.city || "Austin"}, {cust.country}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold">
                      {cust.ordersCount}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                      {formatPrice(cust.totalSpent)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={cust.riskScore > 30 ? "danger" : "success"} size="sm">
                        {cust.riskScore > 30 ? "Elevated Risk" : "Low Risk"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/app/customers/${cust.id}`}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        Profile
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
