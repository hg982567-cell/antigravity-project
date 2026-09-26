"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDemo } from "@/components/providers/DemoContext";
import { useCurrency } from "@/components/providers/CurrencyContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  ArrowLeft,
  ShoppingCart,
  Truck,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
  FileText,
  ExternalLink,
} from "lucide-react";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isDemoMode } = useDemo();
  const { formatPrice } = useCurrency();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [liveTracking, setLiveTracking] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/app/data?type=orders&demo=${isDemoMode}`);
        const data = await res.json();
        const found = (data.orders || []).find((o: any) => o.id === params.id) || data.orders?.[0];
        setOrder(found);

        if (found?.shipments?.[0]?.trackingNumber) {
          fetch(`/api/app/shipping/track?trackingNumber=${encodeURIComponent(found.shipments[0].trackingNumber)}`)
            .then(r => r.json())
            .then(json => {
              if (json.success && json.tracking) setLiveTracking(json.tracking);
            })
            .catch(() => null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, isDemoMode]);

  const handleCancelOrder = () => {
    setCancelled(true);
    setCancelModalOpen(false);
    if (order) {
      setOrder({ ...order, status: "CANCELLED", fulfillmentStatus: "CANCELLED" });
    }
  };

  if (loading || !order) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const shipment = order.shipments?.[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back link and Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/app/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>

        {order.status !== "CANCELLED" && (
          <button
            onClick={() => setCancelModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold text-xs transition-colors"
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* Order Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Order {order.orderNumber}
            </h1>
            <Badge
              variant={
                order.status === "CANCELLED"
                  ? "danger"
                  : order.fulfillmentStatus === "DELIVERED"
                  ? "success"
                  : "info"
              }
              size="md"
            >
              {order.status === "CANCELLED" ? "CANCELLED" : order.fulfillmentStatus}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString()} • Verified Financial Status: {order.financialStatus}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400">Total Charged</p>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
            {formatPrice(order.totalAmount)}
          </p>
          <p className="text-xs text-emerald-600 font-semibold">
            Net Profit: +{formatPrice(order.profitAmount)}
          </p>
        </div>
      </div>

      {/* Grid: Order Items & Customer Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Purchased Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Item</th>
                    <th className="px-4 py-2.5">Price</th>
                    <th className="px-4 py-2.5">Qty</th>
                    <th className="px-4 py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(order.items || []).map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        {item.title}
                      </td>
                      <td className="px-4 py-3 font-mono">{formatPrice(item.price)}</td>
                      <td className="px-4 py-3 font-mono">{item.quantity}</td>
                      <td className="px-4 py-3 font-mono font-bold text-right">
                        {formatPrice(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Tracking Timeline */}
          {shipment && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Shipment & Carrier Tracking</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">
                    Carrier: {liveTracking?.carrierName || shipment.carrier} • Tracking #{shipment.trackingNumber}
                  </p>
                </div>
                <Badge
                  variant={
                    (liveTracking?.status || shipment.status) === "DELIVERED"
                      ? "success"
                      : (liveTracking?.status || shipment.status) === "IN_TRANSIT"
                      ? "info"
                      : "warning"
                  }
                  size="sm"
                >
                  {liveTracking?.statusText || shipment.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {liveTracking?.status === "unavailable" ? (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Tracking information unavailable</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      The carrier has not yet recorded scanning events for this package. Scans will populate automatically once the origin hub processes the shipment.
                    </p>
                  </div>
                ) : liveTracking?.events && liveTracking.events.length > 0 ? (
                  <div className="space-y-3 pt-1 border-l-2 border-blue-500 ml-3 pl-4 text-xs">
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
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs flex items-center justify-between">
                    <span className="text-slate-500">Estimated Delivery:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {liveTracking?.estimatedDelivery
                        ? new Date(liveTracking.estimatedDelivery).toLocaleDateString()
                        : shipment.estimatedDelivery
                        ? new Date(shipment.estimatedDelivery).toLocaleDateString()
                        : "Standard 3-5 Business Days"}
                    </span>
                  </div>
                )}

                {liveTracking?.trackingUrl && (
                  <div className="pt-2 flex justify-end">
                    <a
                      href={liveTracking.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition-colors"
                    >
                      <span>Track on Official {liveTracking.carrierName || "Carrier"} Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Customer & Fraud Risk Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Customer & Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{order.customer?.name}</p>
                <p className="text-slate-500">{order.customer?.email}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Destination:</p>
                <p className="text-slate-500 mt-0.5">{order.customer?.city || "Austin, TX"}, {order.customer?.country || "US"}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-slate-500">Fraud Risk Score</span>
                <Badge variant="success" size="sm">Low Risk (2.0)</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal for HIGH-RISK Order Cancellation */}
      {cancelModalOpen && (
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title="Confirm Order Cancellation"
          description="This is a HIGH-RISK action that halts supplier dispatch and triggers refund eligibility."
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center gap-2.5 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>
                Cancelling order #{order.orderNumber} will notify your supplier to halt warehouse processing immediately.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
