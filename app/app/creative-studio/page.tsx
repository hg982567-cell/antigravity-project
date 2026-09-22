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
} from "lucide-react";
import Link from "next/link";
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
              <p className="font-bold text-white">AI Creative Studio Temporarily Disabled by Platform Owner</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Automated copy generation is turned off in Owner System Settings. Pre-generated samples remain available.</p>
            </div>
          </div>
          <Link href="/owner/system" className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-[11px] font-bold shrink-0 ml-3">
            Owner Controls →
          </Link>
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
