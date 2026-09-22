"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Activity,
  Users,
  UserX,
  Truck,
  DollarSign,
  Cpu,
  Layers,
  CreditCard,
  Lock,
  Radio,
  Sliders,
  FileText,
  Database,
  AlertOctagon,
  LogOut,
  ChevronRight,
  ExternalLink,
  Store,
  BookOpen,
  LifeBuoy,
} from "lucide-react";

interface OwnerSidebarProps {
  onCloseMobile?: () => void;
}

export function OwnerSidebar({ onCloseMobile }: OwnerSidebarProps) {
  const pathname = usePathname();

  const navSections = [
    {
      title: "COMMAND CENTER",
      items: [
        { label: "Overview", href: "/owner/dashboard", icon: Activity },
        { label: "DropAI Stores & Pipeline", href: "/owner/dashboard#stores", icon: Store },
        { label: "System Health", href: "/owner/dashboard#health", icon: Radio },
      ],
    },
    {
      title: "USERS",
      items: [
        { label: "All Users", href: "/owner/users", icon: Users },
        { label: "Suspended Users", href: "/owner/users?status=SUSPENDED", icon: UserX },
      ],
    },
    {
      title: "BUSINESS & PROFIT",
      items: [
        { label: "Shipping Profiles", href: "/owner/shipping", icon: Truck },
        { label: "Profit & Pricing", href: "/owner/profit", icon: DollarSign },
      ],
    },
    {
      title: "AI COMMAND LAYER",
      items: [
        { label: "AI Control Center", href: "/owner/ai", icon: Cpu },
        { label: "Providers & Routing", href: "/owner/ai#routing", icon: Layers },
      ],
    },
    {
      title: "SUBSCRIPTIONS",
      items: [
        { label: "Plans & Pricing", href: "/owner/subscriptions", icon: CreditCard },
      ],
    },
    {
      title: "SECURITY & SECRETS",
      items: [
        { label: "Security & APIs", href: "/owner/security", icon: Lock },
        { label: "Owner Audit Log", href: "/owner/audit", icon: FileText },
      ],
    },
    {
      title: "SYSTEM & CONTROL",
      items: [
        { label: "Feature Flags & System", href: "/owner/system", icon: Sliders },
        { label: "Emergency Lockdown", href: "/owner/system#lockdown", icon: AlertOctagon, alert: true },
      ],
    },
    {
      title: "DISASTER RECOVERY",
      items: [
        { label: "Backups & Recovery", href: "/owner/recovery", icon: Database },
      ],
    },
    {
      title: "SUPPORT & COMPLAINTS",
      items: [
        { label: "Customer Support Desk", href: "/owner/support", icon: LifeBuoy },
      ],
    },
    {
      title: "KNOWLEDGE & DOCS",
      items: [
        { label: "Documentation CMS", href: "/owner/docs", icon: BookOpen },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/owner/auth/logout", { method: "POST" });
      window.location.href = "/owner/login";
    } catch {
      window.location.href = "/owner/login";
    }
  };

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col h-full border-r border-slate-800 shrink-0 select-none">
      {/* Top Brand Tag */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/owner/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Shield className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-black text-sm text-white tracking-wider font-mono">
              DROP<span className="text-amber-400">AI</span>
            </span>
            <span className="block text-[9px] font-bold text-amber-400/90 tracking-widest uppercase">
              OWNER CONTROL
            </span>
          </div>
        </Link>
      </div>

      {/* Direct Bridge to DropAI Merchant Platform */}
      <div className="p-2.5 border-b border-slate-800/60 bg-slate-900/40">
        <Link
          href="/app/dashboard"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 text-xs font-bold transition-all group"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            DropAI Store Platform
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500 text-white font-mono">
            APP
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h4 className="text-[10px] font-extrabold text-slate-400 px-3 tracking-wider uppercase font-mono">
              {section.title}
            </h4>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href.includes("?") && pathname.includes(item.href.split("?")[0]));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-sm"
                        : item.alert
                        ? "text-rose-400 hover:bg-rose-950/30 hover:text-rose-300"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : item.alert ? "text-rose-400" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3 h-3 text-amber-400" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info & Customer Portal Jump */}
      <div className="p-3 border-t border-slate-800/80 space-y-2 bg-slate-950/80">
        <Link
          href="/app/dashboard"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            Customer SaaS Portal
          </span>
          <span className="text-[10px] text-slate-400">/app</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors border border-rose-900/30"
        >
          <LogOut className="w-3.5 h-3.5" />
          End Owner Session
        </button>
      </div>
    </aside>
  );
}
