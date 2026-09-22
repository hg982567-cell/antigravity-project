"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Search,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function CategoryDetailPage() {
  const params = useParams();
  const categoryId = params?.category as string;

  const [articles, setArticles] = useState<any[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!categoryId) return;
    setLoading(true);

    fetch(`/api/docs?category=${categoryId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setArticles(data.articles || []);
          const matched = data.categories?.find((c: any) => c.id === categoryId);
          setCategoryInfo(matched || { name: categoryId.replace(/-/g, " "), description: "" });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [categoryId]);

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/help"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Categories</span>
          </Link>

          <div className="pb-8 border-b border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
              Category Guides
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight capitalize">
              {categoryInfo?.name || categoryId.replace(/-/g, " ")}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              {categoryInfo?.description || "Browse all technical documentation and guides in this category."}
            </p>

            {/* Filter Search */}
            <div className="mt-6 max-w-md relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter guides in this category..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500 shadow-xs"
              />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400 font-mono">
                Loading category guides...
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((art) => (
                  <Link
                    key={art.id}
                    href={`/help/${art.slug}`}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
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

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
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
              <div className="py-12 text-center text-xs text-slate-500">
                No guides found matching your search.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
