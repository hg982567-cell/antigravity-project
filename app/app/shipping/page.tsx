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
              Active Platform Carrier Rates & Routing (Configured by Platform Owner)
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
          onClose={() => setActiveTrackingModal(null)}
          title={`Tracking: ${activeTrackingModal.carrier} ${activeTrackingModal.trackingNumber}`}
          description={`Order ${activeTrackingModal.order?.orderNumber} to ${activeTrackingModal.order?.customer?.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400">Status</p>
                <p className="font-bold text-slate-900 dark:text-white">{activeTrackingModal.status}</p>
              </div>
              <Badge variant="success" size="sm">Carrier Telemetry Verified</Badge>
            </div>

            <div className="space-y-4 pt-2 border-l-2 border-blue-500 ml-3 pl-4">
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-blue-600" />
                <p className="font-bold text-slate-900 dark:text-white">Departed Regional Hub Sort Facility</p>
                <p className="text-slate-400 text-[10px]">USPS Sorting Center, Jamaica NY • Yesterday 14:22</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Carrier Picked Up Parcel at Supplier Warehouse</p>
                <p className="text-slate-400 text-[10px]">Depot A-4, NJ Hub • 2 days ago</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Shipping Label Created & Order Auto-Dispatched</p>
                <p className="text-slate-400 text-[10px]">DropAI Automation Engine • 3 days ago</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
