"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  Share2,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Instagram,
  Video,
  Facebook,
  Youtube,
  Twitter,
  Send,
  Radio,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

interface SocialAccount {
  id: string;
  platform: string;
  accountName: string;
  displayName: string;
  profileUrl?: string;
  webhookUrl?: string;
  status: string;
  autoPublishAds: boolean;
  totalPosts: number;
  lastPostedAt?: string;
  createdAt: string;
  adPosts?: Array<{
    id: string;
    adTitle: string;
    caption: string;
    platform: string;
    status: string;
    createdAt: string;
  }>;
}

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Form State
  const [platform, setPlatform] = useState("INSTAGRAM");
  const [accountName, setAccountName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [autoPublishAds, setAutoPublishAds] = useState(true);

  const loadAccounts = async () => {
    try {
      const res = await fetch("/api/app/social-accounts");
      const data = await res.json();
      if (data.accounts) {
        setAccounts(data.accounts);
      }
    } catch (err) {
      console.error("Failed to load accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) return;

    setSaving(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch("/api/app/social-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          accountName: accountName.trim().startsWith("@") ? accountName.trim() : `@${accountName.trim()}`,
          displayName: displayName.trim() || accountName.trim(),
          profileUrl: profileUrl.trim() || undefined,
          webhookUrl: webhookUrl.trim() || undefined,
          apiKey: apiKey.trim() || undefined,
          autoPublishAds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add account");

      setIsAddModalOpen(false);
      setAccountName("");
      setDisplayName("");
      setProfileUrl("");
      setWebhookUrl("");
      setApiKey("");
      setFeedbackMsg("Social media account connected successfully!");
      setTimeout(() => setFeedbackMsg(null), 3000);
      loadAccounts();
    } catch (err: any) {
      alert(err.message || "Failed to connect account.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to disconnect ${name}?`)) return;
    try {
      const res = await fetch(`/api/app/social-accounts?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAccounts((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getPlatformIcon = (plt: string) => {
    switch (plt.toUpperCase()) {
      case "INSTAGRAM":
        return <Instagram className="w-5 h-5 text-pink-500" />;
      case "TIKTOK":
        return <Video className="w-5 h-5 text-cyan-400" />;
      case "FACEBOOK":
        return <Facebook className="w-5 h-5 text-blue-500" />;
      case "YOUTUBE":
        return <Youtube className="w-5 h-5 text-red-500" />;
      case "TWITTER":
        return <Twitter className="w-5 h-5 text-sky-400" />;
      default:
        return <Share2 className="w-5 h-5 text-indigo-400" />;
    }
  };

  const totalPostsAcrossAccounts = accounts.reduce((acc, a) => acc + (a.totalPosts || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Social Media Accounts
            </h1>
            <Badge variant="purple" size="sm">
              <Sparkles className="w-3 h-3 mr-1" />
              AUTO-PUBLISHER
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Connect up to 25 brand social media accounts to automatically upload and schedule AI ad creatives.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Social Account
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Connected Accounts</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {accounts.length} <span className="text-xs font-normal text-slate-400">/ 25 maximum</span>
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">AI Ads Uploaded</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {totalPostsAcrossAccounts}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Auto-Publish Pipeline</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                ACTIVE
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Accounts Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Connected Brand Accounts
          </h2>
          <span className="text-xs text-slate-500">
            {accounts.length} account{accounts.length === 1 ? "" : "s"} ready for instant publishing
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <Share2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No Social Accounts Connected Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Add your TikTok, Instagram, Facebook, or YouTube accounts. When you generate ad copy with AI, you can auto-upload ads with 1-click!
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md"
            >
              Connect First Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => (
              <Card key={acc.id} className="relative overflow-hidden hover:border-blue-500/50 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {getPlatformIcon(acc.platform)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {acc.displayName}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">{acc.accountName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(acc.id, acc.accountName)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Disconnect account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </CardHeader>

                <CardContent className="space-y-3 pt-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Platform</span>
                    <Badge variant="info" size="sm">{acc.platform}</Badge>
                  </div>
                  <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Status</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {acc.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Ads Uploaded</span>
                    <span className="font-bold text-slate-900 dark:text-white">{acc.totalPosts}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Last Upload</span>
                    <span className="text-slate-400 text-[11px]">
                      {acc.lastPostedAt ? new Date(acc.lastPostedAt).toLocaleDateString() : "No uploads yet"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Connect Social Media Account"
          description="Add a private brand social media profile for automatic AI ad publishing (support up to 25 accounts)."
        >
          <form onSubmit={handleAddAccount} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="INSTAGRAM">Instagram (Reels, Feed & Stories)</option>
                <option value="TIKTOK">TikTok (UGC Video Ads)</option>
                <option value="FACEBOOK">Facebook / Meta Ads Page</option>
                <option value="YOUTUBE">YouTube Shorts & Community</option>
                <option value="TWITTER">X (Twitter Marketing)</option>
                <option value="PINTEREST">Pinterest Product Pins</option>
                <option value="LINKEDIN">LinkedIn Company Page</option>
                <option value="WEBHOOK">Custom Automation Webhook (Zapier/Make/n8n/Bot)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Handle or Username <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. @viral_deals_shop"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display Label
              </label>
              <input
                type="text"
                placeholder="e.g. Main TikTok US Store"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Direct Dispatch Webhook or API Endpoint (Optional)
              </label>
              <input
                type="url"
                placeholder="https://hook.us1.make.com/... or Zapier webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                If provided, ad copies will be dispatched to this webhook for instant automated publishing.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="autoPublish"
                checked={autoPublishAds}
                onChange={(e) => setAutoPublishAds(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="autoPublish" className="text-slate-700 dark:text-slate-300">
                Enable 1-Click Auto-Publish in AI Creative Studio
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold shadow-md flex items-center gap-2"
              >
                {saving ? "Connecting Account..." : "Connect Account"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
