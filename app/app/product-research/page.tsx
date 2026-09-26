"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDemo } from "@/components/providers/DemoContext";
import { useCurrency } from "@/components/providers/CurrencyContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Truck,
  DollarSign,
  PlusCircle,
  ExternalLink,
  CheckCircle2,
  ShieldAlert,
  Percent,
} from "lucide-react";
import { useSystem } from "@/components/providers/SystemContext";

export default function ProductResearchPage() {
  const { isDemoMode } = useDemo();
  const { formatPrice } = useCurrency();
  const { isFeatureEnabled } = useSystem();

  const [products, setProducts] = useState<any[]>([]);
  const [profitRules, setProfitRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [countryTarget, setCountryTarget] = useState("US");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const [prodRes, rulesRes] = await Promise.all([
          fetch(`/api/app/data?type=products&demo=${isDemoMode}`),
          fetch(`/api/app/data?type=pricing_rules`),
        ]);
        const prodData = await prodRes.json();
        const rulesData = await rulesRes.json();
        setProducts(prodData.products || []);
        setProfitRules(rulesData.rules || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [isDemoMode]);

  const filteredProducts = products.filter((p) => {
    const matchQuery = p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All" || p.category === categoryFilter;
    return matchQuery && matchCat;
  });

  const categories = ["All", "Personal Electronics", "Home & Office", "Home Decor", "Phone Accessories", "Pet Supplies", "Fitness & Outdoor"];

  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!selectedProduct) return;
    setImporting(true);
    setImportError(null);
    setImportMessage(null);
    try {
      let prodImages = ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"];
      if (selectedProduct.images) {
        try {
          prodImages = Array.isArray(selectedProduct.images) ? selectedProduct.images : JSON.parse(selectedProduct.images);
        } catch {
          prodImages = [selectedProduct.images];
        }
      } else if (selectedProduct.image) {
        prodImages = [selectedProduct.image];
      }

      const res = await fetch("/api/app/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_product",
          data: {
            title: selectedProduct.title,
            category: selectedProduct.category,
            sellingPrice: selectedProduct.sellingPrice,
            costPrice: selectedProduct.costPrice,
            inventory: selectedProduct.inventory || 200,
            description: selectedProduct.description || `Imported via AI Radar: ${selectedProduct.title}. Verified supplier rating 4.8★.`,
            images: prodImages,
          },
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setImportSuccess(true);
        setImportMessage(json.message || "Product imported successfully to your catalog!");
        setTimeout(() => {
          setImportSuccess(false);
          setImportMessage(null);
          setSelectedProduct(null);
        }, 2200);
      } else {
        setImportError(json.error || "Failed to persist product to database.");
      }
    } catch (e: any) {
      console.error("Import error:", e);
      setImportError(e.message || "Network error occurred while connecting to store database.");
    } finally {
      setImporting(false);
    }
  };

  const featureEnabled = isFeatureEnabled("ai_product_research");
  const activeProfitRule = profitRules[0];

  return (
    <div className="space-y-6">
      {/* Top Title & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Product Research Radar
            </h1>
            <Badge variant="purple" size="sm">
              <Sparkles className="w-3 h-3 mr-1" />
              NEURAL SCORING
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Discover verified high-margin dropshipping items with low competition density.
          </p>
        </div>

        {/* Region Target Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Target Region:</span>
          <select
            value={countryTarget}
            onChange={(e) => setCountryTarget(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="US">🇺🇸 United States</option>
            <option value="UK">🇬🇧 United Kingdom</option>
            <option value="EU">🇩🇪 Germany & EU</option>
            <option value="CA">🇨🇦 Canada</option>
            <option value="AU">🇦🇺 Australia</option>
            <option value="IN">🇮🇳 India</option>
          </select>
        </div>
      </div>

      {/* Feature Flag Disabled Banner */}
      {!featureEnabled && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-white">AI Opportunity Radar Scheduled Maintenance</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Automated neural product scoring is undergoing platform maintenance. Showing verified catalog.</p>
            </div>
          </div>
        </div>
      )}

      {/* Live Platform Profit Rules configured by Owner */}
      {activeProfitRule && (
        <div className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            <Percent className="w-3.5 h-3.5 text-emerald-500" />
            <span>Platform Profit Engine:</span>
            <strong className="text-slate-900 dark:text-white">{activeProfitRule.productMarkup || 2.5}x Markup</strong>
            <span>•</span>
            <strong className="text-slate-900 dark:text-white">{activeProfitRule.minMarginPercent || 20}% Min Margin</strong>
            <span>•</span>
            <strong className="text-slate-900 dark:text-white">{activeProfitRule.platformFeePercent || 2.5}% Platform Fee</strong>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search keywords or niches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? "bg-blue-600 text-white font-semibold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500">No products match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            let images = [];
            try {
              images = JSON.parse(product.images);
            } catch {
              images = [];
            }
            const imgUrl = images[0] || "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600";
            const estProfit = product.sellingPrice - product.costPrice;
            const marginPct = Math.round((estProfit / product.sellingPrice) * 100);

            return (
              <Card key={product.id} className="overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all group">
                <div>
                  {/* Thumbnail with AI Score overlay */}
                  <div className="relative h-52 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={imgUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="purple" size="md">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Score: {product.aiScore}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="success" size="md">
                        +{marginPct}% Margin
                      </Badge>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold uppercase tracking-wider text-[10px] text-blue-600 dark:text-blue-400">
                        {product.category}
                      </span>
                      <span className="font-mono">{product.sku}</span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {product.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Pricing & Profit Grid */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400">Factory Cost</p>
                        <p className="font-semibold font-mono text-slate-700 dark:text-slate-300">
                          {formatPrice(product.costPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">Retail Target</p>
                        <p className="font-semibold font-mono text-slate-900 dark:text-white">
                          {formatPrice(product.sellingPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">Est. Profit</p>
                        <p className="font-bold font-mono text-emerald-600">
                          +{formatPrice(estProfit)}
                        </p>
                      </div>
                    </div>

                    {/* Score Gauges */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Demand Velocity</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{product.demandScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Saturation Risk</span>
                        <span className="font-semibold text-emerald-600">{product.competitionScore}% (Low)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between gap-2">
                  <Link
                    href={`/app/products/${product.id}`}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    View Specs
                  </Link>

                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Import to Store
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Import to Store Confirmation Modal */}
      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title="Import to Connected Store"
          description="Sync product metadata, variants, and automated supplier routing."
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center gap-4">
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{selectedProduct.title}</h4>
                <p className="text-slate-500 mt-0.5">SKU: {selectedProduct.sku}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Target Store</span>
                <span className="font-semibold text-slate-900 dark:text-white">Apex Living USA (Shopify)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Supplier Line</span>
                <span className="font-semibold text-slate-900 dark:text-white">CJ YunExpress Air (6-8 Days)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Suggested Retail Price</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{formatPrice(selectedProduct.sellingPrice)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Initial Stock Sync</span>
                <span className="font-semibold text-emerald-600">{selectedProduct.inventory} units available</span>
              </div>
            </div>

            {importError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-2 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                <span>{importError}</span>
              </div>
            )}

            {importSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center justify-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{importMessage || "Imported to store catalog successfully!"}</span>
              </div>
            ) : (
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold shadow-sm flex items-center gap-1.5"
                >
                  {importing ? "Importing to Catalog..." : "Confirm & Import Product"}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
