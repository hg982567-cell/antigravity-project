"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDemo } from "@/components/providers/DemoContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  Store,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Lock,
} from "lucide-react";

export default function StoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isDemoMode } = useDemo();

  const [store, setStore] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/app/data?type=stores&demo=${isDemoMode}`);
        const data = await res.json();
        const found = (data.stores || []).find((s: any) => s.id === params.id) || data.stores?.[0];
        setStore(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, isDemoMode]);

  const handleSync = (entity: string) => {
    setSyncing(true);
    setSyncMsg(`Syncing ${entity} from ${store?.platform}...`);
    setTimeout(() => {
      setSyncing(false);
      setSyncMsg(`${entity} synchronization completed successfully.`);
      setTimeout(() => setSyncMsg(null), 3000);
    }, 1200);
  };

  if (loading || !store) {
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
        href="/app/stores"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Stores
      </Link>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{store.name}</h1>
            <a
              href={store.storeUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1 mt-1"
            >
              <span>{store.storeUrl}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="success" size="md">
            {store.status}
          </Badge>
          <button
            onClick={() => handleSync("Catalog & Orders")}
            disabled={syncing}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Store"}
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Store Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Platform Provider</span>
              <span className="font-semibold text-slate-900 dark:text-white">{store.platform}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Base Currency</span>
              <span className="font-semibold text-slate-900 dark:text-white">{store.currency}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Target Region</span>
              <span className="font-semibold text-slate-900 dark:text-white">{store.country}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Webhook HMAC Secret</span>
              <span className="font-mono text-slate-500">whsec_••••••••••••8849</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Automated Event Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <span>orders/create (Order routing trigger)</span>
              <span className="text-emerald-600 font-bold">Subscribed</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <span>inventory_levels/update (Stock sync)</span>
              <span className="text-emerald-600 font-bold">Subscribed</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <span>fulfillments/create (Tracking push)</span>
              <span className="text-emerald-600 font-bold">Subscribed</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
