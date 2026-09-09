"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  Layers,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function IntegrationsPage() {
  const [activeModal, setActiveModal] = useState<any | null>(null);

  const integrations = [
    {
      category: "Storefronts",
      items: [
        { name: "Shopify", status: "CONNECTED", desc: "Official OAuth 2.0 PKCE app bridge with bidirectional product/order sync.", icon: "🛍️" },
        { name: "WooCommerce", status: "CONNECTED", desc: "Direct REST API v3 integration with automated webhook listener.", icon: "📦" },
        { name: "BigCommerce", status: "AVAILABLE", desc: "Fast multi-channel inventory synchronization.", icon: "🏬" },
      ],
    },
    {
      category: "Verified Dropshipping Suppliers",
      items: [
        { name: "CJ Dropshipping", status: "CONNECTED", desc: "Global factories, YunExpress special air line, custom packaging.", icon: "✈️" },
        { name: "Zendrop Direct", status: "CONNECTED", desc: "US domestic fast shipping (3-5 business days) with return guarantee.", icon: "⚡" },
        { name: "Spocket Verified", status: "CONNECTED", desc: "Vetted US/EU artisan and direct manufacturer network.", icon: "🌍" },
        { name: "AliExpress Hub", status: "AVAILABLE", desc: "Top-brand direct supplier catalog with automated order placement.", icon: "🛒" },
      ],
    },
    {
      category: "Ad Networks & Attribution",
      items: [
        { name: "Meta Ads (Facebook & IG)", status: "CONNECTED", desc: "Conversions API (CAPI) pixel attribution and ROAS tracking.", icon: "📱" },
        { name: "TikTok For Business", status: "CONNECTED", desc: "Events API and Spark Ads UGC creator collaboration.", icon: "🎵" },
        { name: "Google Ads & Search", status: "CONNECTED", desc: "Shopping feed sync and high-intent keyword tracking.", icon: "🔍" },
      ],
    },
    {
      category: "Payment & Gateway Security",
      items: [
        { name: "Stripe Enterprise", status: "CONNECTED", desc: "PCI-DSS Level 1 compliant checkout and tokenized payout routing.", icon: "💳" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Integrations & App Directory
            </h1>
            <Badge variant="purple" size="sm">
              <ShieldCheck className="w-3 h-3 mr-1" />
              RESTRICTED SCOPES
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Connect verified ecommerce sales channels, fulfillment networks, and advertising attribution pixels.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {integrations.map((group) => (
          <div key={group.category} className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              {group.category}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {group.items.map((item) => (
                <Card key={item.name} className="flex flex-col justify-between p-5 hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-2xl">{item.icon}</div>
                      <Badge
                        variant={item.status === "CONNECTED" ? "success" : "default"}
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      {item.status === "CONNECTED" ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Authorized
                        </>
                      ) : (
                        "Ready to pair"
                      )}
                    </span>

                    <button
                      onClick={() => setActiveModal(item)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {item.status === "CONNECTED" ? "Configure" : "Connect"}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {activeModal && (
        <Modal
          isOpen={!!activeModal}
          onClose={() => setActiveModal(null)}
          title={`${activeModal.name} Integration Setup`}
          description="Enterprise OAuth 2.0 PKCE or API Key Configuration"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">Connection Pipeline</p>
              <p className="text-slate-500">{activeModal.desc}</p>
            </div>

            <div className="space-y-2 text-slate-600 dark:text-slate-300">
              <p>• Scopes: Strict minimal permissions (Read/Write Orders & Inventory only)</p>
              <p>• Data Encryption: Tokens stored via AES-256-GCM</p>
              <p>• Inbound Webhook: Verified via SHA256 HMAC signature verification</p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
              >
                Close Settings
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
