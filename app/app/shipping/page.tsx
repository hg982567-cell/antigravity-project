"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDemo } from "@/components/providers/DemoContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  Send,
  Truck,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
} from "lucide-react";

export default function ShippingPage() {
  const { isDemoMode } = useDemo();
  const [shipments, setShipments] = useState<any[]>([]);
  const [shippingRules, setShippingRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTrackingModal, setActiveTrackingModal] = useState<any | null>(null);
  const [liveTracking, setLiveTracking] = useState<any | null>(null);
  const [loadingTracking, setLoadingTracking] = useState(false);

  useEffect(() => {
    if (!activeTrackingModal) {
      setLiveTracking(null);
      return;
    }
    async function fetchTrackingTelemetry() {
      setLoadingTracking(true);
      try {
        const res = await fetch(`/api/app/shipping/track?trackingNumber=${encodeURIComponent(activeTrackingModal.trackingNumber)}`);
        const json = await res.json();
        if (json.success && json.tracking) {
          setLiveTracking(json.tracking);
        } else {
          setLiveTracking({
            status: "unavailable",
            statusText: "Tracking information unavailable",
            events: [],
            isAvailable: false,
          });
        }
      } catch (err) {
        console.error("Failed to fetch tracking telemetry:", err);
        setLiveTracking({
          status: "unavailable",
          statusText: "Tracking information unavailable",
          events: [],
          isAvailable: false,
        });
      } finally {
        setLoadingTracking(false);
      }
    }
    fetchTrackingTelemetry();
  }, [activeTrackingModal]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [shipRes, rulesRes] = await Promise.all([
          fetch(`/api/app/data?type=shipping&demo=${isDemoMode}`),
          fetch(`/api/app/data?type=shipping_rules`),
        ]);
        const data = await shipRes.json();
        const rulesData = await rulesRes.json();
        setShipments(data.shipments || []);
        setShippingRules(rulesData.rules || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isDemoMode]);

  const filtered = shipments.filter(s =>
    s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.carrier.toLowerCase().includes(search.toLowerCase()) ||
    (s.order?.orderNumber || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Global Shipping & Logistics
            </h1>
            <span className="text-xs text-slate-500 font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
              {shipments.length} Active Shipments
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time carrier milestone tracking, delay alerts, and automatic delivery confirmations.
          </p>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tracking number, carrier, or order #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Live Carrier Rates Configured by Owner */}
      {shippingRules.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-blue-500" />
              Active Platform Carrier Rates & Routing
            </h3>
            <span className="text-[10px] font-mono text-slate-400">{shippingRules.length} Active Carrier Protocols</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shippingRules.slice(0, 3).map((r) => (
              <div key={r.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white truncate">{r.methodName}</span>
                  <Badge variant="info" size="sm">{r.countryCode || "Global"}</Badge>
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Base Cost: <strong className="text-emerald-500 font-mono">${r.baseCost?.toFixed(2)}</strong></span>
                  <span>{r.deliveryDaysEstimate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200/60 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Carrier</th>
                  <th className="px-4 py-3">Tracking Number</th>
                  <th className="px-4 py-3">Order Number</th>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Current Status</th>
                  <th className="px-4 py-3">Estimated Delivery</th>
                  <th className="px-4 py-3 text-right">Milestones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {s.carrier}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      <button
                        onClick={() => setActiveTrackingModal(s)}
                        className="hover:underline flex items-center gap-1 text-left"
                      >
                        <span>{s.trackingNumber}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      <Link href={`/app/orders/${s.order?.id}`} className="hover:underline">
                        {s.order?.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {s.order?.customer?.city || "Austin, TX"}, {s.order?.customer?.country || "US"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          s.status === "DELIVERED"
                            ? "success"
                            : s.status === "IN_TRANSIT"
                            ? "info"
                            : "warning"
                        }
                        size="sm"
                      >
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {s.estimatedDelivery ? new Date(s.estimatedDelivery).toLocaleDateString() : "3-5 Days"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setActiveTrackingModal(s)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View Timeline
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Milestones Modal */}
      {activeTrackingModal && (
        <Modal
          isOpen={!!activeTrackingModal}
          onClose={() => {
            setActiveTrackingModal(null);
            setLiveTracking(null);
          }}
          title={`Shipment Telemetry: ${activeTrackingModal.carrier} ${activeTrackingModal.trackingNumber}`}
          description={`Order ${activeTrackingModal.order?.orderNumber || "Ref"} to ${activeTrackingModal.order?.customer?.name || "Customer"}`}
        >
          <div className="space-y-4 text-xs">
            {loadingTracking ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-3">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 font-mono text-[11px]">Contacting carrier logistics gateway...</p>
              </div>
            ) : liveTracking && liveTracking.status === "unavailable" ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Tracking information unavailable</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    The carrier has not yet recorded scanning events for tracking number <strong className="font-mono text-white">{activeTrackingModal.trackingNumber}</strong>. Milestones will automatically appear as soon as the carrier registers receipt at their sorting hub.
                  </p>
                </div>

                {liveTracking.trackingUrl && (
                  <div className="pt-2 flex justify-end">
                    <a
                      href={liveTracking.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 font-semibold text-xs border border-slate-700 transition-colors"
                    >
                      <span>Check on {liveTracking.carrierName || "Carrier Portal"}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400">Carrier Status</p>
                    <p className="font-bold text-slate-900 dark:text-white">{liveTracking?.statusText || activeTrackingModal.status}</p>
                  </div>
                  <Badge
                    variant={
                      (liveTracking?.status || activeTrackingModal.status) === "DELIVERED"
                        ? "success"
                        : "info"
                    }
                    size="sm"
                  >
                    Carrier Verified
                  </Badge>
                </div>

                {liveTracking?.events && liveTracking.events.length > 0 ? (
                  <div className="space-y-4 pt-2 border-l-2 border-blue-500 ml-3 pl-4">
                    {liveTracking.events.map((evt: any, idx: number) => (
                      <div key={idx} className="relative">
                        <div
                          className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full ${
                            idx === liveTracking.events.length - 1
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
                ) : (
                  <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Carrier Scan Registered</p>
                    <p className="text-slate-400 text-[11px] mt-1">Package in transit with {activeTrackingModal.carrier}. Detailed route milestones are synchronizing.</p>
                  </div>
                )}

                {liveTracking?.trackingUrl && (
                  <div className="pt-2 flex justify-end">
                    <a
                      href={liveTracking.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition-colors"
                    >
                      <span>Carrier Portal Tracking</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
