"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  MapPin,
} from "lucide-react";

export default function CustomerTrackPage() {
  const [lookupQuery, setLookupQuery] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<any | null>(null);
  const [orderData, setOrderData] = useState<any | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTrackingData(null);
    setOrderData(null);

    const query = lookupQuery.trim();
    const email = customerEmail.trim().toLowerCase();

    if (!query) {
      setError("Please enter your Order Number or Tracking Number.");
      return;
    }

    if (!email) {
      setError("Please enter the email address used during checkout to verify your order.");
      return;
    }

    setLoading(true);
    try {
      const isOrderNum = query.startsWith("#") || query.toUpperCase().startsWith("ORD-");
      const url = isOrderNum
        ? `/api/app/shipping/track?orderNumber=${encodeURIComponent(query)}&email=${encodeURIComponent(email)}`
        : `/api/app/shipping/track?trackingNumber=${encodeURIComponent(query)}&email=${encodeURIComponent(email)}`;

      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(
          json.error ||
          "No matching order was found for this Order Number / Tracking Number and Email combination. Please check your order confirmation."
        );
        return;
      }

      setTrackingData(json.tracking);
      setOrderData(json.order);
    } catch (err) {
      console.error("Tracking lookup error:", err);
      setError("Failed to connect to the logistics network. Please try again in a few moments.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 sm:py-16 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Truck className="w-3.5 h-3.5" />
            <span>RAVAN SHIPPING Global Telemetry Portal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Track Your Shipment
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Real-time multi-carrier milestone tracking. Enter your Order Number or Tracking Number along with your confirmation email.
          </p>
        </div>

        {/* Lookup Card Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Order Number or Tracking Number
                </label>
                <div className="relative">
                  <Package className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. #ORD-123456 or 94001118..."
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Customer Email Address
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. customer@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Protected by end-to-end customer isolation
              </span>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Synchronizing...</span>
                  </>
                ) : (
                  <>
                    <span>Track Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Tracking Results Card */}
        {trackingData && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Overview Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[11px] text-slate-400 font-mono">ORDER REFERENCE</span>
                  <h2 className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                    {orderData?.orderNumber || trackingData.trackingNumber}
                  </h2>
                </div>

                <Badge
                  variant={
                    trackingData.status === "DELIVERED"
                      ? "success"
                      : trackingData.status === "unavailable"
                      ? "warning"
                      : "info"
                  }
                  size="md"
                >
                  {trackingData.statusText}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 text-[10px]">Carrier</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{trackingData.carrierName}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Tracking Number</p>
                  <p className="font-mono font-semibold text-blue-600 dark:text-blue-400 mt-0.5 break-all">
                    {trackingData.trackingNumber}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Destination</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {orderData?.destinationCity || "US Hub"}, {orderData?.destinationCountry || "US"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Estimated Delivery</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {trackingData.estimatedDelivery
                      ? new Date(trackingData.estimatedDelivery).toLocaleDateString()
                      : "Standard 3-5 Business Days"}
                  </p>
                </div>
              </div>

              {/* Status Unavailable Fallback Banner */}
              {trackingData.status === "unavailable" && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2 mt-4">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Tracking information unavailable</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {trackingData.message || "The carrier has not yet recorded scanning events for this package. Scans will populate automatically once the sorting hub logs the parcel."}
                  </p>
                </div>
              )}

              {/* Live Timeline Milestones */}
              {trackingData.events && trackingData.events.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Shipment Journey
                  </h3>

                  <div className="space-y-4 border-l-2 border-blue-500 ml-3 pl-4 text-xs">
                    {trackingData.events.map((evt: any, idx: number) => (
                      <div key={idx} className="relative">
                        <div
                          className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full ${
                            idx === trackingData.events.length - 1
                              ? "bg-blue-600 ring-4 ring-blue-500/20"
                              : "bg-slate-300 dark:bg-slate-700"
                          }`}
                        />
                        <p className="font-bold text-slate-900 dark:text-white">{evt.description}</p>
                        <p className="text-slate-400 text-[10px]">
                          {evt.location} • {new Date(evt.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Official Carrier Link */}
              {trackingData.trackingUrl && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <a
                    href={trackingData.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    <span>Track on Official {trackingData.carrierName} Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Purchased Items Card */}
            {orderData?.items && orderData.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xs uppercase tracking-wider text-slate-500">
                    Order Items in this Shipment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {orderData.items.map((item: any) => (
                      <div key={item.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                          <p className="text-slate-400 text-[11px]">Quantity: {item.quantity}</p>
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          ${item.price?.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
