"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Truck,
  Star,
  Clock,
  ShieldCheck,
  Search,
  ExternalLink,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Plus,
  Trash2,
  AlertCircle,
  Building2,
  RefreshCw,
  Globe,
  Mail,
} from "lucide-react";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "VERIFIED" | "CUSTOM">("ALL");

  // Add Supplier Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    platform: "DIRECT",
    country: "US",
    contactEmail: "",
    websiteUrl: "",
    fulfillmentSpeedDays: 5,
    rating: 4.9,
    reliabilityScore: 98.0,
    returnPolicy: "30-day buyer protection & full refund",
    notes: "",
  });

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/app/suppliers?filter=${filterType}`);
      const data = await res.json();
      setSuppliers(data.suppliers || []);
    } catch (err) {
      console.error("Failed to load suppliers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [filterType]);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/app/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSupplier),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add supplier");
      }

      setIsModalOpen(false);
      setNewSupplier({
        name: "",
        platform: "DIRECT",
        country: "US",
        contactEmail: "",
        websiteUrl: "",
        fulfillmentSpeedDays: 5,
        rating: 4.9,
        reliabilityScore: 98.0,
        returnPolicy: "30-day buyer protection & full refund",
        notes: "",
      });
      loadSuppliers();
    } catch (err: any) {
      setModalError(err.message || "Failed to save supplier");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSupplier = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove '${name}' from your supplier directory?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/app/suppliers?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        loadSuppliers();
      } else {
        alert(data.error || "Could not delete supplier");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.platform.toLowerCase().includes(search.toLowerCase()) ||
      s.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Supplier Directory &amp; Supply Chain
            </h1>
            <Badge variant="success" size="sm">
              <ShieldCheck className="w-3 h-3 mr-1" />
              VERIFIED HUBS &amp; CUSTOM FACTORIES
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your verified fulfillment hubs, private agents, and custom supplier partnerships.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSuppliers}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            title="Refresh Suppliers"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all hover:shadow-blue-500/25 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Supplier</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search suppliers by name, platform, country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto text-xs">
          {[
            { key: "ALL", label: "All Network" },
            { key: "VERIFIED", label: "Verified Hubs" },
            { key: "CUSTOM", label: "My Custom Suppliers" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                filterType === tab.key
                  ? "bg-blue-600 text-white font-bold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Supplier Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-56 bg-slate-100 dark:bg-slate-800/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No suppliers found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You haven't added any custom suppliers under this filter yet. Click the button below to connect your first real supplier!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Supplier</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((sup) => (
            <Card key={sup.id} className="hover:shadow-md transition-all border border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${
                      sup.isCustom
                        ? "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50"
                        : "bg-blue-50 dark:bg-blue-900/30 text-blue-600"
                    }`}
                  >
                    {sup.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{sup.name}</CardTitle>
                      {sup.isCustom ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                          CUSTOM
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                          VERIFIED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      Origin: {sup.country} • Platform: <strong className="font-semibold text-slate-700 dark:text-slate-300">{sup.platform}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Badge variant="success" size="md">
                    <Star className="w-3 h-3 mr-1 fill-emerald-500 text-emerald-500" />
                    {sup.rating.toFixed(1)}
                  </Badge>
                  {sup.isCustom && (
                    <button
                      onClick={() => handleDeleteSupplier(sup.id, sup.name)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remove Supplier"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400">Reliability</p>
                    <p className="font-bold text-emerald-600 font-mono mt-0.5">{sup.reliabilityScore}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Avg Lead Time</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                      {sup.fulfillmentSpeedDays} Days
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Orders Fulfilled</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                      {sup.totalOrdersFulfilled.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                  <p className="flex items-center gap-1.5">
                    <strong className="text-slate-700 dark:text-slate-300">Policy:</strong>
                    <span>{sup.returnPolicy}</span>
                  </p>
                  {sup.contactEmail && (
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <a href={`mailto:${sup.contactEmail}`} className="text-blue-600 hover:underline">
                        {sup.contactEmail}
                      </a>
                    </p>
                  )}
                  {sup.websiteUrl && (
                    <p className="flex items-center gap-1.5">
                      <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                      <a
                        href={sup.websiteUrl.startsWith("http") ? sup.websiteUrl : `https://${sup.websiteUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {sup.websiteUrl} <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  )}
                  {sup.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                      "{sup.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Direct Route Active
                  </span>
                  <Link
                    href={`/app/suppliers/${sup.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Warehouses &amp; SKUs
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Custom Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Add Custom Supplier / Private Agent
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Connect your private manufacturing partner, 1688 agent, or local fulfillment center.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSupplier} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Supplier / Factory Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    placeholder="e.g. Shenzhen Elite Logistics Co."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Platform / Type *
                  </label>
                  <select
                    value={newSupplier.platform}
                    onChange={(e) => setNewSupplier({ ...newSupplier, platform: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DIRECT">Direct Factory / Manufacturer</option>
                    <option value="ALIEXPRESS">AliExpress Verified Seller</option>
                    <option value="CJ_DROPSHIPPING">CJ Dropshipping Agent</option>
                    <option value="ZENDROP">Zendrop Partner</option>
                    <option value="1688">1688 Sourcing Agent</option>
                    <option value="US_WAREHOUSE">US Local Warehouse</option>
                    <option value="EU_WAREHOUSE">EU Local Warehouse</option>
                    <option value="CUSTOM">Custom Private Agent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Country of Origin *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    value={newSupplier.country}
                    onChange={(e) => setNewSupplier({ ...newSupplier, country: e.target.value.toUpperCase() })}
                    placeholder="US, CN, IN, DE, UK"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Avg Lead Time (Days) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    required
                    value={newSupplier.fulfillmentSpeedDays}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, fulfillmentSpeedDays: parseInt(e.target.value) || 5 })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Supplier Rating (1-5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={newSupplier.rating}
                    onChange={(e) => setNewSupplier({ ...newSupplier, rating: parseFloat(e.target.value) || 4.9 })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Email / WeChat / Skype
                  </label>
                  <input
                    type="text"
                    value={newSupplier.contactEmail}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contactEmail: e.target.value })}
                    placeholder="agent@factory.com or WeChat ID"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Catalog / Website URL
                  </label>
                  <input
                    type="text"
                    value={newSupplier.websiteUrl}
                    onChange={(e) => setNewSupplier({ ...newSupplier, websiteUrl: e.target.value })}
                    placeholder="https://supplier-portal.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dispute &amp; Return Policy
                </label>
                <input
                  type="text"
                  value={newSupplier.returnPolicy}
                  onChange={(e) => setNewSupplier({ ...newSupplier, returnPolicy: e.target.value })}
                  placeholder="e.g. 100% reship on damaged goods within 14 days"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Internal Notes &amp; Terms
                </label>
                <textarea
                  rows={2}
                  value={newSupplier.notes}
                  onChange={(e) => setNewSupplier({ ...newSupplier, notes: e.target.value })}
                  placeholder="Special pricing agreements, MOQ thresholds, or packaging guidelines..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
                >
                  {saving ? "Adding to Supply Chain..." : "Save Custom Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
