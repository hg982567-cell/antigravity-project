"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDemo } from "@/components/providers/DemoContext";
import { useCurrency } from "@/components/providers/CurrencyContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  Sparkles,
  Save,
  Truck,
  DollarSign,
  TrendingUp,
  Layers,
  CheckCircle2,
  Trash2,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isDemoMode } = useDemo();
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [inventory, setInventory] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [aiOptimizing, setAiOptimizing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/app/data?type=products&demo=${isDemoMode}`);
        const data = await res.json();
        const found = (data.products || []).find((p: any) => p.id === params.id) || data.products?.[0];
        if (found) {
          setProduct(found);
          setTitle(found.title);
          setDescription(found.description);
          setSellingPrice(found.sellingPrice);
          setCostPrice(found.costPrice);
          setInventory(found.inventory);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, isDemoMode]);

  const handleAiRewrite = () => {
    setAiOptimizing(true);
    setTimeout(() => {
      setDescription(
        `Engineered for maximum daily comfort and durability. Features next-generation ergonomic contouring, military-grade materials, and an ultra-breathable outer sleeve. Backed by a 30-day money-back satisfaction guarantee and fast tracked 3-5 day shipping.`
      );
      setAiOptimizing(false);
    }, 900);
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1500);
  };

  if (loading || !product) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const profit = sellingPrice - costPrice;
  const margin = sellingPrice > 0 ? Math.round((profit / sellingPrice) * 100) : 0;

  let img = "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600";
  try {
    const parsed = JSON.parse(product.images);
    if (parsed[0]) img = parsed[0];
  } catch {}

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/app/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products Catalog
        </Link>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Image & Supplier Specs */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="h-64 w-full bg-slate-100 dark:bg-slate-800">
              <img src={img} alt={title} className="w-full h-full object-cover" />
            </div>
            <CardContent className="p-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">AI Win Score</span>
                <span className="font-bold text-blue-600">{product.aiScore} / 100</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Target Region</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{product.countryTarget}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Fulfillment Partner</span>
                <span className="font-semibold text-emerald-600">CJ Dropshipping Air</span>
              </div>
            </CardContent>
          </Card>

          {/* Real-Time Margin Calculator */}
          <Card className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Margin & Profit Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Margin</span>
                <span className="font-bold text-emerald-600 text-sm">+{margin}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Profit Per Unit</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">+{formatPrice(profit)}</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Based on active factory cost of {formatPrice(costPrice)}.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Title, Description, Pricing Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Product Description
                  </label>
                  <button
                    type="button"
                    onClick={handleAiRewrite}
                    disabled={aiOptimizing}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    {aiOptimizing ? "Optimizing with AI..." : "AI SEO Rewriter"}
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Selling Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cost Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={inventory}
                    onChange={(e) => setInventory(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
