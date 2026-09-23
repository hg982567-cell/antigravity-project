"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Clock,
  ArrowRight,
  LifeBuoy,
} from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketResult, setTicketResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "TECHNICAL",
    priority: "MEDIUM",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit ticket. Please try again.");
      }

      setTicketResult(data.ticket);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16]">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Official RAVAN SHIPPING Customer Support Desk</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Customer Support &amp; Dispute Resolution
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Submit your inquiry or complaint directly to our Operations Team. Every ticket is logged in our central database and dispatched to our business email with a guaranteed response SLA.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Support Channels & SLAs */}
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <Mail className="w-6 h-6 text-blue-600 mb-3" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Business Support Email</h2>
                <p className="text-xs text-slate-500 mt-1">Direct inquiries routed to platform administrators.</p>
                <a
                  href="mailto:owner@ravanshipping.com"
                  className="text-xs font-semibold text-blue-600 hover:underline mt-2 block font-mono"
                >
                  owner@ravanshipping.com
                </a>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <Clock className="w-6 h-6 text-emerald-600 mb-3" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Response Guarantees</h2>
                <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <p className="flex items-center justify-between">
                    <span>Critical / Urgent:</span>
                    <strong className="text-rose-600 font-mono">&lt; 2 Hours</strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>High Priority:</span>
                    <strong className="text-amber-600 font-mono">&lt; 6 Hours</strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Standard Inquiries:</span>
                    <strong className="text-slate-700 dark:text-slate-300 font-mono">&lt; 24 Hours</strong>
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200 dark:border-blue-900/40">
                <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Self-Serve Knowledge Base</h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Have a technical question about Shopify OAuth, order machine states, or suppliers? Check our 42 production guides.
                </p>
                <Link
                  href="/help"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Search Help Center <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Ticket Submission Form */}
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">
                    {ticketResult?.ticketNumber || "TICKET RECEIVED"}
                  </span>
                  <h2 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Support Ticket Logged Successfully
                  </h2>
                  <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                    Your complaint has been registered in the database and dispatched directly to{" "}
                    <strong className="text-slate-700 dark:text-slate-300">{ticketResult?.businessEmail || "owner@ravanshipping.com"}</strong>.
                    Our operations team will review your case and respond to your email shortly.
                  </p>

                  <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-left max-w-md mx-auto text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Reference Number:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{ticketResult?.ticketNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="text-emerald-600 font-semibold uppercase">{ticketResult?.status || "OPEN"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target Resolution:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Within Guaranteed SLA</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        subject: "",
                        category: "TECHNICAL",
                        priority: "MEDIUM",
                        message: "",
                      });
                    }}
                    className="mt-6 px-5 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Your Contact Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="merchant@yourstore.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Inquiry Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="TECHNICAL">Technical Support &amp; Integrations</option>
                        <option value="BILLING">Payment, Billing &amp; Subscriptions</option>
                        <option value="SUPPLIER">Supplier Dispute &amp; Fulfillment</option>
                        <option value="COMPLAINT">Customer Service Complaint</option>
                        <option value="FEATURE_REQUEST">Feature Request &amp; Suggestions</option>
                        <option value="GENERAL">General Inquiries</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Urgency Level
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="LOW">Low (General question)</option>
                        <option value="MEDIUM">Medium (Standard issue)</option>
                        <option value="HIGH">High (Impacts store operations)</option>
                        <option value="URGENT">Urgent (Orders / Store blocked)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Subject Line *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Issue connecting Zendrop tracking numbers to Shopify"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Detailed Message / Complaint Description *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Please provide full details, error messages, store URL, or order IDs to help us resolve this quickly..."
                    />
                  </div>

                  <p className="text-[11px] text-slate-400">
                    By submitting, your ticket is securely dispatched to our business operations desk and permanently archived in our audit database.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {loading ? "Dispatching to Business Support..." : "Submit Complaint to Business Support"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
