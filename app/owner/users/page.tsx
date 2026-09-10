"use client";

import React, { useState, useEffect } from "react";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { ReAuthModal } from "@/components/owner/ReAuthModal";
import {
  Users,
  Search,
  Filter,
  UserX,
  UserCheck,
  LogOut,
  Trash2,
  Shield,
  CreditCard,
  ExternalLink,
  Store,
  Package,
  ShoppingCart,
  RefreshCw,
} from "lucide-react";

export default function OwnerUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // ReAuth state for destructive actions
  const [reAuthOpen, setReAuthOpen] = useState(false);
  const [reAuthAction, setReAuthAction] = useState<any | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/owner/users?search=${encodeURIComponent(search)}&status=${statusFilter}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleAction = async (action: string, targetUserId: string, payload?: any) => {
    try {
      const res = await fetch("/api/owner/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          userId: targetUserId,
          ...payload,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      alert(data.message || "Operation completed.");
      loadUsers();
      if (selectedUser?.id === targetUserId) {
        setSelectedUser(null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Trigger ReAuth for soft deletion
  const requestDelete = (user: any) => {
    setReAuthAction({
      type: "soft_delete",
      user,
      title: `Deactivate & Soft-Delete User: ${user.email}`,
      description: `This will permanently deactivate ${user.email}, revoke all active device sessions, and mark account deleted.`,
    });
    setReAuthOpen(true);
  };

  const handleReAuthConfirm = async (password: string, mfaCode: string) => {
    if (!reAuthAction) return;
    await handleAction(reAuthAction.type, reAuthAction.user.id, { password, mfaCode });
  };

  return (
    <OwnerShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight font-mono">
              USER CONTROL CENTER
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              {users.length} MERCHANTS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Search, inspect 360 profiles, suspend, enforce force-logout, and manage plan allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadUsers}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by User ID, Name, or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["ALL", "ACTIVE", "SUSPENDED", "DELETED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                statusFilter === st
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-mono text-[11px]">
                <th className="px-4 py-3">User & Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Footprint</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Owner Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {users.map((u) => {
                const isOwnerAccount = u.role === "OWNER";
                return (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{u.name}</span>
                          {isOwnerAccount && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                              SUPER ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 font-mono text-[11px] mt-0.5">{u.email}</p>
                        <p className="text-slate-500 font-mono text-[9px]">{u.id}</p>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-300 font-semibold">
                      {u.role}
                    </td>

                    <td className="px-4 py-3">
                      {u.deletedAt ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          DELETED
                        </span>
                      ) : u.isSuspended ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                          SUSPENDED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          ACTIVE
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-amber-400">
                      {u.subscription?.plan || "FREE"}
                    </td>

                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                      <span title="Connected Stores">{u._count?.stores || 0} stores</span> •{" "}
                      <span title="Products">{u._count?.products || 0} prods</span> •{" "}
                      <span title="Orders">{u._count?.orders || 0} orders</span>
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                        >
                          Profile 360
                        </button>

                        {!isOwnerAccount && !u.deletedAt && (
                          <>
                            {u.isSuspended ? (
                              <button
                                onClick={() => handleAction("unsuspend", u.id)}
                                title="Unsuspend User"
                                className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-950/40"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAction("suspend", u.id, { reason: "Policy violation review." })}
                                title="Suspend User"
                                className="p-1 rounded-lg text-amber-400 hover:bg-amber-950/40"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => handleAction("force_logout", u.id)}
                              title="Force Logout All Sessions"
                              className="p-1 rounded-lg text-blue-400 hover:bg-blue-950/40"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => requestDelete(u)}
                              title="Soft Delete Account (Re-Auth Required)"
                              className="p-1 rounded-lg text-rose-400 hover:bg-rose-950/40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile 360 Drawer Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                  {selectedUser.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedUser.name}</h3>
                  <p className="text-xs font-mono text-slate-400">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-4 gap-3 text-center font-mono">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Stores</span>
                <span className="text-lg font-bold text-white">{selectedUser._count?.stores || 0}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Products</span>
                <span className="text-lg font-bold text-white">{selectedUser._count?.products || 0}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Orders</span>
                <span className="text-lg font-bold text-white">{selectedUser._count?.orders || 0}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">AI Requests</span>
                <span className="text-lg font-bold text-white">{selectedUser._count?.aiRequests || 0}</span>
              </div>
            </div>

            {/* Plan Modification Controls */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase font-mono flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                Subscription Plan Override
              </h4>
              <div className="flex items-center gap-2">
                {["FREE", "STARTER", "PRO", "BUSINESS", "ENTERPRISE"].map((p) => (
                  <button
                    key={p}
                    onClick={() => handleAction("change_plan", selectedUser.id, { plan: p })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                      selectedUser.subscription?.plan === p
                        ? "bg-amber-500 text-slate-950 shadow"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ReAuth Confirmation Modal for Destructive Operations */}
      {reAuthOpen && (
        <ReAuthModal
          isOpen={reAuthOpen}
          onClose={() => {
            setReAuthOpen(false);
            setReAuthAction(null);
          }}
          onConfirm={handleReAuthConfirm}
          title={reAuthAction?.title || "Owner Confirmation"}
          actionDescription={reAuthAction?.description || "Execute privileged action"}
          isDestructive={true}
        />
      )}
    </OwnerShell>
  );
}
