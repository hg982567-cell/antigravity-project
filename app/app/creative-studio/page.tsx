"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Palette,
  Sparkles,
  Copy,
  CheckCircle2,
  Video,
  FileText,
  Sliders,
  Layers,
  ArrowRight,
  ShieldAlert,
  Share2,
  Send,
} from "lucide-react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { useSystem } from "@/components/providers/SystemContext";

export default function CreativeStudioPage() {
  const { isFeatureEnabled } = useSystem();
  const featureEnabled = isFeatureEnabled("ai_ad_creative_studio");
  const [productName, setProductName] = useState("Self-Cleaning Pet Steam Brush");
  const [targetAudience, setTargetAudience] = useState("Dog & Cat Owners (US/UK)");
  const [platform, setPlatform] = useState("TIKTOK");
  const [generating, setGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [generatedCopies, setGeneratedCopies] = useState([
    {
      type: "Viral UGC Script (TikTok/Reels)",
      badge: "AI-GENERATED",
      hook: `"Stop using standard wire brushes on your shedding pets! Watch what happened when this steam groomer arrived..."`,
      body: `Notice how the gentle nano-mist keeps hair from flying across the living room while massaging their skin. One click ejects the entire fur disc cleanly into the trash.`,
      cta: `Tap the link below to get 30% off during our restock flash sale!`,
    },
    {
      type: "Problem-Agitation-Solution (Meta/Instagram)",
      badge: "AI-GENERATED",
      hook: `Tired of pet hair covering every sofa, rug, and black t-shirt you own?`,
      body: `Over 14,000 pet owners made the switch to our viral ultrasonic steam de-shedder. Zero static, zero mess, 100% painless grooming your pets actually purr for. Backed by a 30-day money-back guarantee with free tracked US shipping.`,
      cta: `Shop Today & Save 35% with code PETCARE`,
    },
    {
      type: "High-Intent Google Headline & Description",
      badge: "AI-GENERATED",
      hook: `Official Pet Steam Brush | Fast 3-5 Day Domestic US Delivery`,
      body: `The viral de-shedding groomer with nano-mist technology. Easy 1-click clean. Rated 4.9/5 stars by 8,000+ happy pet parents. Free 30-day returns.`,
      cta: `Order Now While Inventory Lasts`,
    },
  ]);

  const [generationMeta, setGenerationMeta] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;
    setGenerating(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/ai/creative-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, targetAudience, platform }),
      });
      const data = await res.json();
      if (res.ok && data.copies && data.copies.length > 0) {
        setGeneratedCopies(data.copies);
        if (data.modelUsed) {
          setGenerationMeta(`Live AI Generated in ${data.latencyMs || 600}ms via ${data.providerUsed || "AI"} (${data.modelUsed})`);
        }
      } else {
        setErrorMsg(data.error || "Failed to generate copy");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedAdForPublish, setSelectedAdForPublish] = useState<any | null>(null);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  const handleOpenPublishModal = async (copy: any) => {
    setSelectedAdForPublish(copy);
    setPublishSuccess(null);
    setPublishModalOpen(true);
    try {
      const res = await fetch("/api/app/social-accounts");
      const data = await res.json();
      if (data.accounts) {
        setSocialAccounts(data.accounts);
        setSelectedAccountIds(data.accounts.filter((a: any) => a.autoPublishAds).map((a: any) => a.id));
      }
    } catch (e) {
      console.error("Failed to load social accounts for publishing:", e);
    }
  };

  const toggleAccountSelection = (id: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExecutePublish = async () => {
    if (!selectedAdForPublish || selectedAccountIds.length === 0) return;
    setPublishing(true);
    setPublishSuccess(null);
    try {
      const res = await fetch("/api/app/social-accounts/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountIds: selectedAccountIds,
          adTitle: `${productName} — ${selectedAdForPublish.type}`,
          hook: selectedAdForPublish.hook,
          caption: selectedAdForPublish.body,
          cta: selectedAdForPublish.cta,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPublishSuccess(data.message || `Uploaded successfully to ${data.publishedCount} accounts!`);
        setTimeout(() => {
          setPublishModalOpen(false);
          setPublishSuccess(null);
        }, 2200);
      } else {
        alert(data.error || "Failed to publish ad.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to publish ad.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Creative Studio
            </h1>
            <Badge variant="purple" size="sm">
              <Sparkles className="w-3 h-3 mr-1" />
              COPYWRITER & SCRIPT ENGINE
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate high-converting advertising creatives, UGC scripts, and marketing hooks tailored to your dropshipping catalog.
          </p>
        </div>
      </div>

      {!featureEnabled && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-white">AI Creative Studio Scheduled Maintenance</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Automated AI copy generation is currently undergoing maintenance. Pre-generated high-converting samples remain available.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Creative Prompt Generator</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Product Target
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Audience Persona
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Ad Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="TIKTOK">TikTok (UGC Hook & Trend)</option>
                  <option value="META">Meta / Instagram (Pain Point & Carousel)</option>
                  <option value="GOOGLE">Google Search (High Intent)</option>
                  <option value="YOUTUBE">YouTube Shorts</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {generating ? "Generating Angles..." : "Generate High-Converting Copy"}
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Right: Generated Output Cards */}
        <div className="lg:col-span-2 space-y-4">
          {generationMeta && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{generationMeta}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {generatedCopies.map((copy, idx) => (
            <Card key={idx} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <CardTitle className="text-sm">{copy.type}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="purple" size="sm">
                    {copy.badge}
                  </Badge>
                  <button
                    onClick={() => handleCopy(`${copy.hook}\n\n${copy.body}\n\n${copy.cta}`, idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Copy full copy"
                  >
                    {copiedIndex === idx ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase text-slate-400">0-3s Hook / Headline</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-1 italic">{copy.hook}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Body & Social Proof</p>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{copy.body}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Call To Action (CTA)</p>
                  <p className="font-semibold text-blue-600 dark:text-blue-400 mt-1">{copy.cta}</p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleOpenPublishModal(copy)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Auto-Upload to Social Accounts
                  </button>
                  <span className="text-[11px] text-slate-400">
                    Direct brand upload
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Auto-Upload to Social Accounts Modal */}
      {publishModalOpen && (
        <Modal
          isOpen={publishModalOpen}
          onClose={() => setPublishModalOpen(false)}
          title="Auto-Upload Ad to Brand Social Accounts"
          description="Select which connected social media channels will receive this AI-generated ad copy and hook."
        >
          <div className="space-y-4 text-xs">
            {publishSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>{publishSuccess}</span>
              </div>
            ) : (
              <>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Ad Angle</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedAdForPublish?.type}</p>
                  <p className="text-slate-600 dark:text-slate-300 italic line-clamp-2 mt-1">{selectedAdForPublish?.hook}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-bold text-slate-900 dark:text-white">
                      Select Publishing Accounts ({selectedAccountIds.length} selected):
                    </label>
                    <Link
                      href="/app/social-accounts"
                      className="text-blue-600 hover:underline font-semibold text-[11px]"
                    >
                      + Manage Accounts
                    </Link>
                  </div>

                  {socialAccounts.length === 0 ? (
                    <div className="p-6 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                      <Share2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No social accounts connected yet</p>
                      <p className="text-slate-500 text-[11px] mt-1">Connect your Instagram, TikTok, or Meta account first to enable automatic publishing.</p>
                      <Link
                        href="/app/social-accounts"
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-[11px]"
                      >
                        Connect Social Media Accounts →
                      </Link>
                    </div>
                  ) : (
                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                      {socialAccounts.map((acc) => {
                        const isChecked = selectedAccountIds.includes(acc.id);
                        return (
                          <div
                            key={acc.id}
                            onClick={() => toggleAccountSelection(acc.id)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                              isChecked
                                ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-500/50"
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                              />
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white text-xs">{acc.displayName}</p>
                                <p className="text-[10px] text-slate-500 font-mono">{acc.accountName}</p>
                              </div>
                            </div>
                            <Badge variant="info" size="sm">{acc.platform}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPublishModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecutePublish}
                    disabled={publishing || selectedAccountIds.length === 0}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold shadow-md flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {publishing ? "Uploading & Publishing..." : `Upload to ${selectedAccountIds.length} Account(s)`}
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
