"use client";

import React, { useState } from "react";
import { useCurrency } from "@/components/providers/CurrencyContext";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Settings,
  User,
  Building,
  Globe,
  Bell,
  Sparkles,
  Save,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function SettingsPage() {
  const { currentCurrency, setCurrency, availableCurrencies } = useCurrency();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("PROFILE");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Profile Form
  const [name, setName] = useState("Alex Rivera");
  const [email, setEmail] = useState("demo@dropai.io");
  const [businessName, setBusinessName] = useState("Apex Living Commerce LLC");
  const [taxId, setTaxId] = useState("US-EIN-9928192");
  const [timeZone, setTimeZone] = useState("America/Los_Angeles");

  // AI Preferences
  const [aiConfidenceThreshold, setAiConfidenceThreshold] = useState("80");
  const [autoDraftAds, setAutoDraftAds] = useState(true);
  const [fraudStrictness, setFraudStrictness] = useState("MEDIUM");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const tabs = [
    { id: "PROFILE", label: "Profile & Account", icon: User },
    { id: "BUSINESS", label: "Business & Legal", icon: Building },
    { id: "LOCALIZATION", label: "Currency & Region", icon: Globe },
    { id: "AI", label: "AI Preferences", icon: Sparkles },
    { id: "NOTIFICATIONS", label: "Alert Preferences", icon: Bell },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Settings & Preferences
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure merchant identity, multi-currency conversion, and AI risk tolerances.
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Preferences Saved!
          </span>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-6">
            {activeTab === "PROFILE" && (
              <div className="space-y-4 max-w-xl text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Merchant Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400 cursor-not-allowed font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">To change email, verify via Security Center.</p>
                </div>
              </div>
            )}

            {activeTab === "BUSINESS" && (
              <div className="space-y-4 max-w-xl text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Business Legal Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tax ID / EIN Number
                  </label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {activeTab === "LOCALIZATION" && (
              <div className="space-y-4 max-w-xl text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Display Currency
                  </label>
                  <select
                    value={currentCurrency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {availableCurrencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name} ({c.code} - {c.symbol})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Dynamic exchange rates convert base store revenue automatically.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Merchant Time Zone
                  </label>
                  <select
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                    <option value="America/New_York">America/New_York (EST/EDT)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                    <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === "AI" && (
              <div className="space-y-4 max-w-xl text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Minimum Product Score Threshold ({aiConfidenceThreshold}/100)
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    value={aiConfidenceThreshold}
                    onChange={(e) => setAiConfidenceThreshold(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Products scoring below {aiConfidenceThreshold} will be filtered out of recommended radars.
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Auto-Draft Ad Creatives</p>
                    <p className="text-[11px] text-slate-400">Automatically stage 3 TikTok/Meta angles when importing products.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoDraftAds}
                    onChange={(e) => setAutoDraftAds(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </div>
              </div>
            )}

            {activeTab === "NOTIFICATIONS" && (
              <div className="space-y-3 max-w-xl text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Low Inventory Warnings</p>
                    <p className="text-[11px] text-slate-400">Alert me when factory warehouse stock drops below 50 units.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Fraud Risk Holds</p>
                    <p className="text-[11px] text-slate-400">Immediate email alert when an order risk score exceeds 60%.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                Save Preferences
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
