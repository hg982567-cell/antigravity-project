"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Package,
  Truck,
  Store,
  ShoppingCart,
  Users,
  Send,
  Megaphone,
  Palette,
  BarChart3,
  Bot,
  Zap,
  Bell,
  Layers,
  Shield,
  ShieldAlert,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Share2,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  isOwner?: boolean;
}

export function Sidebar({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
  isOwner = false,
}: SidebarProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      group: "Operations",
      items: [
        { name: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
        { name: "Product Research", href: "/app/product-research", icon: Search, badge: "AI" },
        { name: "Products", href: "/app/products", icon: Package },
        { name: "Suppliers", href: "/app/suppliers", icon: Truck },
        { name: "Stores", href: "/app/stores", icon: Store },
        { name: "Orders", href: "/app/orders", icon: ShoppingCart },
        { name: "Customers", href: "/app/customers", icon: Users },
        { name: "Shipping", href: "/app/shipping", icon: Send },
      ],
    },
    {
      group: "Growth & Intelligence",
      items: [
        { name: "Ads Manager", href: "/app/ads", icon: Megaphone },
        { name: "Creative Studio", href: "/app/creative-studio", icon: Palette, badge: "AI" },
        { name: "Social Accounts", href: "/app/social-accounts", icon: Share2, badge: "NEW" },
        { name: "Analytics", href: "/app/analytics", icon: BarChart3 },
        { name: "AI Assistant", href: "/app/ai-assistant", icon: Bot, badge: "Copilot" },
        { name: "Automations", href: "/app/automations", icon: Zap },
      ],
    },
    {
      group: "Platform",
      items: [
        { name: "Notifications", href: "/app/notifications", icon: Bell },
        { name: "Integrations", href: "/app/integrations", icon: Layers },
        { name: "Security Center", href: "/app/security", icon: ShieldAlert },
        { name: "Billing", href: "/app/billing", icon: CreditCard },
        { name: "Documentation", href: "/help", icon: BookOpen },
        { name: "Settings", href: "/app/settings", icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-[#0b0f19] border-r border-slate-200 dark:border-slate-800/80 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/80">
          <Link
            href="/app/dashboard"
            className={cn(
              "flex items-center gap-3 overflow-hidden",
              isCollapsed && "justify-center w-full"
            )}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  DropAI
                </span>
                <span className="text-[10px] font-medium text-slate-400 -mt-1">
                  Enterprise OS
                </span>
              </div>
            )}
          </Link>

          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hidden lg:flex"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Links with Scroll */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationItems.map((group) => (
            <div key={group.group}>
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-2">
                  {group.group}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/app/dashboard");
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group relative",
                        isActive
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60",
                        isCollapsed && "justify-center px-0 py-2.5"
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5 shrink-0 transition-colors",
                          isActive
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                        )}
                      />

                      {!isCollapsed && (
                        <span className="truncate flex-1">{item.name}</span>
                      )}

                      {!isCollapsed && item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                          {item.badge}
                        </span>
                      )}

                      {/* Tooltip on collapse */}
                      {isCollapsed && (
                        <span className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Dedicated Owner Command Center Entry Point - ONLY VISIBLE TO PLATFORM OWNER */}
        {isOwner && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
            <Link
              href="/owner/dashboard"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs transition-all group relative",
                isCollapsed && "justify-center px-0 py-2.5"
              )}
              title={isCollapsed ? "Owner Super Admin Control Center" : undefined}
            >
              <Shield className="w-4 h-4 shrink-0 text-amber-500 stroke-[2.5]" />
              {!isCollapsed && (
                <>
                  <span className="truncate flex-1">Owner Admin</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black tracking-wider">
                    ROOT
                  </span>
                </>
              )}

              {isCollapsed && (
                <span className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-amber-400 text-xs rounded-md shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap font-bold">
                  Owner Admin
                </span>
              )}
            </Link>
          </div>
        )}

        {/* Expand button when collapsed */}
        {isCollapsed && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-center hidden lg:flex">
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
