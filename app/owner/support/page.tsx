"use client";

import React, { useState, useEffect } from "react";
import { OwnerShell } from "@/components/owner/OwnerShell";
import {
  LifeBuoy,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Mail,
  User,
  ArrowRight,
  ShieldAlert,
  Send,
} from "lucide-react";

export default function OwnerSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [counts, setCounts] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/support");
      const data = await res.json();
      setTickets(data.tickets || []);
      setCounts(data.counts || { total: 0, open: 0, inProgress: 0, resolved: 0 });
    } catch (err) {
      console.error("Failed to load support tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setUpdating(true);

    try {
      const res = await fetch("/api/owner/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          status: newStatus || selectedTicket.status,
          resolutionNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedTicket(null);
        loadTickets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const filtered = tickets.filter((t) => {
    const matchesFilter = statusFilter === "ALL" || t.status === statusFilter;
    const matchesSearch =
      t.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <OwnerShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <LifeBuoy className="w-6 h-6 text-amber-500" />
                Customer Support &amp; Complaints Desk
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Direct inbox for all customer inquiries and complaints routed to <code className="text-amber-400 font-mono">owner@ravanshipping.com</code>.
            </p>
          </div>

          <button
            onClick={loadTickets}
            className="self-start px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-500" : ""}`} />
            <span>Refresh Tickets</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <p className="text-xs text-slate-400">Total Inquiries</p>
            <p className="text-2xl font-bold text-white font-mono mt-1">{counts.total}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <p className="text-xs text-amber-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Needs Attention
            </p>
            <p className="text-2xl font-bold text-amber-400 font-mono mt-1">{counts.open}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <p className="text-xs text-blue-400">In Progress</p>
            <p className="text-2xl font-bold text-blue-400 font-mono mt-1">{counts.inProgress}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Resolved
            </p>
            <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">{counts.resolved}</p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ticket #, customer, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
            {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === status
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white bg-slate-950"
                }`}
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No customer complaints or support tickets found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Subject &amp; Message</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                        {t.ticketNumber}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-white">{t.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{t.email}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate">
                        <div className="font-medium text-slate-200">{t.subject}</div>
                        <div className="text-slate-400 truncate text-[11px]">{t.message}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            t.priority === "URGENT"
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : t.priority === "HIGH"
                              ? "bg-amber-950 text-amber-300 border border-amber-800"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            t.status === "RESOLVED"
                              ? "bg-emerald-950 text-emerald-400"
                              : t.status === "IN_PROGRESS"
                              ? "bg-blue-950 text-blue-400"
                              : "bg-amber-950 text-amber-400"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedTicket(t);
                            setNewStatus(t.status);
                            setResolutionNotes(t.resolutionNotes || "");
                          }}
                          className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                        >
                          Review &amp; Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Ticket Detail & Resolution Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                    {selectedTicket.ticketNumber}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedTicket.subject}</h3>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer:</span>
                  <span className="text-white font-semibold">{selectedTicket.name} ({selectedTicket.email})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Routed To Business Email:</span>
                  <span className="text-amber-400 font-mono">{selectedTicket.businessEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Submitted:</span>
                  <span className="text-slate-300">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Customer Message / Complaint:
                </label>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {selectedTicket.message}
                </div>
              </div>

              <form onSubmit={handleUpdateTicket} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Update Ticket Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="OPEN">OPEN (Needs Attention)</option>
                    <option value="IN_PROGRESS">IN_PROGRESS (Investigating)</option>
                    <option value="RESOLVED">RESOLVED (Customer notified)</option>
                    <option value="CLOSED">CLOSED (Completed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Resolution Notes / Internal Actions
                  </label>
                  <textarea
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Enter resolution notes, refund ID, or reply summary sent to customer email..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors disabled:opacity-50"
                  >
                    {updating ? "Saving..." : "Save Ticket Resolution"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </OwnerShell>
  );
}
