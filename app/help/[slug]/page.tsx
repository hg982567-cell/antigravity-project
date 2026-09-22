"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MarkdownRenderer } from "@/components/docs/MarkdownRenderer";
import { Badge } from "@/components/ui/Badge";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  User,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  BookOpen,
  Search,
  Share2,
  LifeBuoy,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [feedbackLoading, setFeedbackLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeHeading, setActiveHeading] = useState("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setFeedbackSubmitted(false);

    fetch(`/api/docs/${slug}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Article could not be loaded.");
        }
        setData(json);
      })
      .catch((err) => {
        console.error("Error fetching article:", err);
        setError(err.message || "Failed to load documentation article.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Extract table of contents headings (H2 & H3) from article content
  const headings: { id: string; text: string; level: number }[] = React.useMemo(() => {
    if (!data?.article?.content) return [];
    const lines = data.article.content.split("\n");
    const found: { id: string; text: string; level: number }[] = [];

    lines.forEach((line: string) => {
      if (line.startsWith("## ")) {
        const text = line.replace("## ", "").trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        found.push({ id, text, level: 2 });
      } else if (line.startsWith("### ")) {
        const text = line.replace("### ", "").trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        found.push({ id, text, level: 3 });
      }
    });

    return found;
  }, [data]);

  // Handle active scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (let i = headings.length - 1; i >= 0; i--) {
        const element = document.getElementById(headings[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveHeading(headings[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  const handleFeedback = async (isHelpful: boolean) => {
    if (feedbackSubmitted || feedbackLoading) return;
    setFeedbackLoading(true);
    try {
      await fetch("/api/docs/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleSlug: slug,
          isHelpful,
        }),
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error("Feedback error:", err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-600 animate-spin">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-xs font-mono text-slate-400">Loading documentation guide...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !data?.article) {
    const isAuthError = error?.includes("Authentication required") || error?.includes("Member");
    const isOwnerError = error?.includes("Platform Owner") || error?.includes("Admin");

    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-md p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isOwnerError ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'}`}>
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {isOwnerError ? "Restricted Administrative Guide" : (isAuthError ? "Member Authentication Required" : "Article Not Found")}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              {error || "The requested technical documentation article does not exist or has been archived."}
            </p>

            <div className="mt-6 flex flex-col gap-2">
              {isAuthError && (
                <Link
                  href={`/auth/login?redirect=/help/${slug}`}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm"
                >
                  Log In to View Guide
                </Link>
              )}
              {isOwnerError && (
                <Link
                  href="/owner/login"
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-sm"
                >
                  Owner Super Admin Login
                </Link>
              )}
              <Link
                href="/help"
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
              >
                Back to Knowledge Base
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { article, prevArticle, nextArticle, categoryArticles, relatedArticles } = data;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
      <Navbar />

      {/* Subheader / Breadcrumbs bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#090d18]/80 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between text-xs">
          <nav className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap py-1">
            <Link href="/help" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium">
              Docs
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <Link
              href={`/help/category/${article.category}`}
              className="hover:text-blue-600 dark:hover:text-blue-400 capitalize font-medium"
            >
              {article.category.replace(/-/g, " ")}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="text-slate-900 dark:text-white font-bold truncate max-w-xs sm:max-w-md">
              {article.title}
            </span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1 transition-colors"
              title="Copy link to article"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
            </button>

            {/* Mobile Navigation Drawer Toggle */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1"
            >
              <Menu className="w-4 h-4" />
              <span className="text-[11px] font-semibold">Articles</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDEBAR: Category navigation & articles tree */}
          <aside className={`lg:col-span-3 lg:block ${mobileNavOpen ? 'fixed inset-0 z-50 bg-slate-950/80 p-4 backdrop-blur-xs' : 'hidden'}`}>
            <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 lg:sticky lg:top-32 max-h-[80vh] overflow-y-auto shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Category Guides</span>
                </div>
                {mobileNavOpen && (
                  <button onClick={() => setMobileNavOpen(false)} className="lg:hidden text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {categoryArticles?.map((item: any) => {
                  const isActive = item.slug === article.slug;
                  return (
                    <Link
                      key={item.id}
                      href={`/help/${item.slug}`}
                      onClick={() => setMobileNavOpen(false)}
                      className={`block px-3 py-2 rounded-xl text-xs transition-colors leading-snug ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-950/60 font-bold text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {item.title}
                    </Link>
                  );
                })}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/help"
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>All Categories</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* CENTER: Main Article Content */}
          <article className="lg:col-span-6 min-w-0">
            {/* Header Metadata */}
            <div className="pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="info" size="sm">
                  {article.category.replace(/-/g, " ")}
                </Badge>
                {article.visibility === "AUTHENTICATED" && (
                  <Badge variant="purple" size="sm">Member Documentation</Badge>
                )}
                {article.visibility === "ADMIN_ONLY" && (
                  <Badge variant="warning" size="sm">Admin Only</Badge>
                )}
                <span className="text-[11px] text-slate-400 font-mono">v{article.version || "1.0.0"}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {article.title}
              </h1>

              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {article.description}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{article.author || "DropAI Engineering"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Updated {new Date(article.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{article.readingTime || "5 min read"}</span>
                </div>
              </div>
            </div>

            {/* In-page Mobile TOC Accordion */}
            {headings.length > 0 && (
              <div className="lg:hidden mb-6 p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-500 block mb-2">
                  Table of Contents
                </span>
                <ul className="space-y-1.5 text-xs text-blue-600 dark:text-blue-400">
                  {headings.map((h) => (
                    <li key={h.id} style={{ paddingLeft: `${(h.level - 2) * 12}px` }}>
                      <a href={`#${h.id}`} className="hover:underline">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Markdown Article Body */}
            <div className="prose dark:prose-invert max-w-none">
              <MarkdownRenderer content={article.content} />
            </div>

            {/* Previous & Next Navigation */}
            <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevArticle ? (
                <Link
                  href={`/help/${prevArticle.slug}`}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all group flex flex-col justify-between"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous Guide
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1">
                    {prevArticle.title}
                  </span>
                </Link>
              ) : <div />}

              {nextArticle ? (
                <Link
                  href={`/help/${nextArticle.slug}`}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all group flex flex-col justify-between sm:text-right"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-end gap-1 mb-1">
                    Next Guide <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1">
                    {nextArticle.title}
                  </span>
                </Link>
              ) : <div />}
            </div>

            {/* Interactive Feedback Section ("Was this article helpful?") */}
            <div className="mt-10 p-6 rounded-2xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-center">
              {feedbackSubmitted ? (
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Thank you! Your feedback helps us improve our documentation.</span>
                </div>
              ) : (
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    Was this article helpful?
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Let us know if this technical guide solved your problem.
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleFeedback(true)}
                      disabled={feedbackLoading}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Yes</span>
                    </button>
                    <button
                      onClick={() => handleFeedback(false)}
                      disabled={feedbackLoading}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-rose-500 hover:text-rose-600 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
                      <span>No</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Support Escalation */}
            <div className="mt-8 p-6 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="font-bold text-xs text-blue-700 dark:text-blue-400 uppercase tracking-wide flex items-center gap-1">
                  <LifeBuoy className="w-3.5 h-3.5" /> Need Assistance?
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Can&apos;t find what you need? Open a diagnostic ticket with our engineering team.
                </p>
              </div>
              <Link
                href="/contact"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shrink-0 text-center"
              >
                Contact Support
              </Link>
            </div>
          </article>

          {/* RIGHT SIDEBAR: Sticky Table of Contents */}
          <aside className="lg:col-span-3 hidden lg:block">
            <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sticky top-32 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                On this page
              </span>

              {headings.length > 0 ? (
                <nav className="space-y-1 text-xs">
                  {headings.map((h) => {
                    const isActive = activeHeading === h.id;
                    return (
                      <a
                        key={h.id}
                        href={`#${h.id}`}
                        style={{ paddingLeft: `${(h.level - 2) * 12}px` }}
                        className={`block py-1 transition-colors leading-snug ${
                          isActive
                            ? "font-bold text-blue-600 dark:text-blue-400"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      >
                        {h.text}
                      </a>
                    );
                  })}
                </nav>
              ) : (
                <p className="text-xs text-slate-400 italic">No section headings</p>
              )}

              {/* Related Articles Box */}
              {relatedArticles?.length > 0 && (
                <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Related Articles
                  </span>
                  <div className="space-y-2">
                    {relatedArticles.map((rel: any) => (
                      <Link
                        key={rel.id}
                        href={`/help/${rel.slug}`}
                        className="block text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1"
                      >
                        • {rel.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
