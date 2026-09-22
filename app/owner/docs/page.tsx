"use client";

import React, { useState, useEffect } from "react";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Lock,
  Archive,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { id: "getting-started", name: "Getting Started" },
  { id: "product-research-ai", name: "Product Research & AI" },
  { id: "shopify-integrations", name: "Shopify & Store Integrations" },
  { id: "automations-fulfillment", name: "Automations & Fulfillment" },
  { id: "orders", name: "Orders" },
  { id: "payments-currency", name: "Payments, Currency & Profit" },
  { id: "security-account", name: "Security & Account" },
  { id: "troubleshooting", name: "Troubleshooting" },
  { id: "developer-api", name: "Developer / Technical API" },
  { id: "admin-system", name: "Admin & System Documentation" },
];

export default function OwnerDocsManagementPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("getting-started");
  const [subcategory, setSubcategory] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("PUBLISHED");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [readingTime, setReadingTime] = useState("5 min read");
  const [sortOrder, setSortOrder] = useState(0);
  const [featured, setFeatured] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/docs");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load owner docs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingArticle(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setContent("");
    setCategory("getting-started");
    setSubcategory("");
    setTags("");
    setStatus("PUBLISHED");
    setVisibility("PUBLIC");
    setReadingTime("5 min read");
    setSortOrder(0);
    setFeatured(false);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (art: any) => {
    setEditingArticle(art);
    setTitle(art.title);
    setSlug(art.slug);
    setDescription(art.description || "");
    setContent(art.content || "");
    setCategory(art.category);
    setSubcategory(art.subcategory || "");
    setTags(art.tags || "");
    setStatus(art.status);
    setVisibility(art.visibility);
    setReadingTime(art.readingTime || "5 min read");
    setSortOrder(art.sortOrder || 0);
    setFeatured(Boolean(art.featured));
    setFormError(null);
    setModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingArticle) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    const payload = {
      id: editingArticle?.id,
      title,
      slug,
      description,
      content,
      category,
      subcategory,
      tags,
      status,
      visibility,
      readingTime,
      sortOrder: Number(sortOrder),
      featured,
    };

    try {
      const method = editingArticle ? "PUT" : "POST";
      const res = await fetch("/api/owner/docs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Operation failed.");
      }

      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || "Failed to save article.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/owner/docs?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteConfirmId(null);
        loadData();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const articles = data?.articles || [];
  const filtered = articles.filter((art: any) => {
    const matchSearch =
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.slug.toLowerCase().includes(search.toLowerCase()) ||
      art.tags.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "ALL" || art.category === categoryFilter;
    const matchStatus = statusFilter === "ALL" || art.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <OwnerShell>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold uppercase tracking-wider">
                CMS CONTROL LAYER
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-mono">Knowledge Base Management</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              Documentation & Knowledge Base CMS
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Author, publish, edit, and organize customer-facing and internal technical guides.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/help"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>View Live Help Center</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Article</span>
            </button>
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Articles</span>
            <span className="text-xl font-black text-white mt-1 block">{data?.stats?.total || 0}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Published</span>
            <span className="text-xl font-black text-emerald-400 mt-1 block">{data?.stats?.published || 0}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">Drafts</span>
            <span className="text-xl font-black text-amber-400 mt-1 block">{data?.stats?.drafts || 0}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block">Archived</span>
            <span className="text-xl font-black text-rose-400 mt-1 block">{data?.stats?.archived || 0}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block">Admin Only</span>
            <span className="text-xl font-black text-purple-400 mt-1 block">{data?.stats?.adminOnly || 0}</span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, slug, or tag..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-blue-500"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {/* Articles Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Title & Slug</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Feedback</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                      Loading documentation articles...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No documentation articles match current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((art: any) => (
                    <tr key={art.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-white line-clamp-1">{art.title}</p>
                        <p className="text-[10px] font-mono text-slate-500">/{art.slug}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-slate-300 font-medium">
                          {art.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {art.visibility === "PUBLIC" && (
                          <Badge variant="success" size="sm">Public</Badge>
                        )}
                        {art.visibility === "AUTHENTICATED" && (
                          <Badge variant="purple" size="sm">Members</Badge>
                        )}
                        {art.visibility === "ADMIN_ONLY" && (
                          <Badge variant="warning" size="sm">Admin Only</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {art.status === "PUBLISHED" && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                            PUBLISHED
                          </span>
                        )}
                        {art.status === "DRAFT" && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">
                            DRAFT
                          </span>
                        )}
                        {art.status === "ARCHIVED" && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 font-bold">
                            ARCHIVED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {art.sortOrder}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="text-emerald-400">+{art.helpfulYes || 0}</span>
                        <span className="text-slate-600 mx-1">/</span>
                        <span className="text-rose-400">-{art.helpfulNo || 0}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/help/${art.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Preview article"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => openEditModal(art)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 transition-colors"
                            title="Edit article"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(art.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 transition-colors"
                            title="Delete article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create / Edit Article Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-3xl my-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white">
                  {editingArticle ? "Edit Documentation Article" : "Create New Documentation Article"}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Article Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. How to Connect Shopify using OAuth PKCE"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">URL Slug</label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. connecting-shopify-oauth-pkce"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Short Summary / Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief 1-2 sentence synopsis shown in search results..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-blue-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Visibility Scope</label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-blue-500"
                    >
                      <option value="PUBLIC">Public (Anyone)</option>
                      <option value="AUTHENTICATED">Authenticated Members</option>
                      <option value="ADMIN_ONLY">Admin / Owner Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-blue-500"
                    >
                      <option value="PUBLISHED">Published</option>
                      <option value="DRAFT">Draft</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="shopify, oauth, pkce"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Reading Time</label>
                    <input
                      type="text"
                      value={readingTime}
                      onChange={(e) => setReadingTime(e.target.value)}
                      placeholder="5 min read"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Sort Order (0-100)</label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Article Markdown Content
                  </label>
                  <textarea
                    rows={12}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="## Overview&#10;&#10;Write detailed technical guide in GitHub-flavored markdown..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-hidden focus:border-blue-500 leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    {formSubmitting ? "Saving..." : editingArticle ? "Save Changes" : "Publish Article"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <div className="w-full max-w-sm p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Delete Documentation Article?</h3>
              <p className="text-xs text-slate-400">
                This will permanently delete this technical article and all feedback records from the database. This action cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OwnerShell>
  );
}
