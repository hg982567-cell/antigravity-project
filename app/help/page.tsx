"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Search,
  BookOpen,
  Rocket,
  Store,
  Zap,
  ShoppingCart,
  DollarSign,
  Shield,
  HelpCircle,
  Code,
  Lock,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Flame,
  LifeBuoy,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const CATEGORY_ICONS: Record<string, any> = {
  "getting-started": Rocket,
  "product-research-ai": Search,
  "shopify-integrations": Store,
  "automations-fulfillment": Zap,
  orders: ShoppingCart,
  "payments-currency": DollarSign,
  "security-account": Shield,
  troubleshooting: HelpCircle,
  "developer-api": Code,
};

export default function HelpCenterPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const fetchDocs = async (searchQuery: string = "", cat: string = "") => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("query", searchQuery);
      if (cat) params.set("category", cat);
      const res = await fetch(`/api/docs?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load documentation:", err);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  // Keyboard shortcut '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && (document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA")) {
        e.preventDefault();
        document.getElementById("docs-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    fetchDocs(query, selectedCategory);
  };

  const handleCategoryClick = (catId: string) => {
    if (selectedCategory === catId) {
      setSelectedCategory("");
      fetchDocs(query, "");
    } else {
      setSelectedCategory(catId);
      fetchDocs(query, catId);
    }
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedCategory("");
    fetchDocs("", "");
  };

  const categories = data?.categories || [];
  const articles = data?.articles || [];
  const popularArticles = data?.popularArticles || [];
  const recentArticles = data?.recentArticles || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/50 via-white to-transparent dark:from-blue-950/20 dark:via-[#070b14] dark:to-[#070b14]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide uppercase shadow-xs mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Documentation & Knowledge Base
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
              How can we help your store?
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Browse technical guides, integration tutorials, troubleshooting guides, and best practices for scaling with DropAI.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-8 max-w-2xl mx-auto">
              <div className="relative flex items-center shadow-xl shadow-blue-500/5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-all p-1.5">
                <Search className="w-5 h-5 text-slate-400 ml-3.5 shrink-0" />
                <input
                  id="docs-search-input"
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (e.target.value === "") {
                      fetchDocs("", selectedCategory);
                    }
                  }}
                  placeholder="Search articles, guides, webhooks, errors, tools... (Press '/' to focus)"
                  className="w-full px-3 py-2.5 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      fetchDocs("", selectedCategory);
                    }}
                    className="px-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm shrink-0 flex items-center gap-1.5"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Filter Tags */}
              <div className="mt-3 flex items-center justify-center flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-400">Quick searches:</span>
                {["Shopify OAuth", "DropAI Brain", "USPS Tracking", "Fraud Holds", "2FA Setup", "REST API"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setQuery(tag);
                      fetchDocs(tag, selectedCategory);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/60 dark:border-slate-700/60"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Active Search Results View */}
          {query ? (
            <div className="space-y-6 mb-16">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Search Results for &quot;{query}&quot;
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Found {articles.length} matching {articles.length === 1 ? "article" : "articles"}
                  </p>
                </div>
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  View All Categories
                </button>
              </div>

              {articles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {articles.map((art: any) => (
                    <Link
                      key={art.id}
                      href={`/help/${art.slug}`}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="info" size="sm">
                            {art.category.replace("-", " ")}
                          </Badge>
                          {art.visibility === "AUTHENTICATED" && (
                            <Badge variant="purple" size="sm">Member Only</Badge>
                          )}
                          {art.visibility === "ADMIN_ONLY" && (
                            <Badge variant="warning" size="sm">Admin Only</Badge>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {art.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                          {art.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {art.readingTime}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                          Read Guide <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-3">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    No documentation found
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    We couldn&apos;t find any articles matching &quot;{query}&quot;. Try checking for spelling errors, broader keywords, or browse our primary categories below.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700"
                  >
                    Reset Search & View Categories
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {/* Popular Articles Banner */}
          {!query && popularArticles.length > 0 && (
            <div className="mb-14">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-4 h-4 text-orange-500" />
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Popular Articles & Recommended Guides
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {popularArticles.map((art: any) => (
                  <Link
                    key={art.id}
                    href={`/help/${art.slug}`}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-xs group flex items-start justify-between gap-3"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
                        {art.category.replace("-", " ")}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {art.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                        {art.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 10 Primary Categories Grid */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Knowledge Base Categories
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Explore full documentation arranged by operational workflow.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((cat: any) => {
                const IconComponent = CATEGORY_ICONS[cat.id] || BookOpen;
                const isSelected = selectedCategory === cat.id;

                return (
                  <div
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border cursor-pointer transition-all shadow-xs hover:shadow-lg flex flex-col justify-between group ${
                      isSelected
                        ? "border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {cat.articleCount} {cat.articleCount === 1 ? "guide" : "guides"}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                      <span>{isSelected ? "Filtering category" : "Browse category"}</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recently Updated Articles */}
          {!query && recentArticles.length > 0 && (
            <div className="mb-16 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Recently Updated Articles
                  </h3>
                </div>
                <span className="text-xs text-slate-500">Continuous platform updates</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentArticles.map((art: any) => (
                  <Link
                    key={art.id}
                    href={`/help/${art.slug}`}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {art.category.replace("-", " ")}
                      </span>
                      <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {art.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0">
                      <span>{art.readingTime}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Support Escalation Section */}
          <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-white text-xs font-bold mb-4">
                <LifeBuoy className="w-3.5 h-3.5" />
                Technical Support Escalation
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Still having trouble with your store?
              </h2>
              <p className="mt-2 text-sm text-blue-100 leading-relaxed">
                If our technical guides didn&apos;t resolve your issue, our specialized engineers are on standby to inspect store logs, investigate webhook timeouts, or verify supplier connections.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/contact"
                  className="px-5 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 shadow-md transition-colors inline-flex items-center gap-2"
                >
                  <span>Open Support Ticket</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/app/security"
                  className="px-4 py-2.5 rounded-xl bg-blue-800/60 hover:bg-blue-800 text-white font-semibold text-xs border border-white/20 transition-colors"
                >
                  View Security Diagnostics
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
