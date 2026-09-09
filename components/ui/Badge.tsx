import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple" | "outline";
  size?: "sm" | "md";
}

export function Badge({ className, variant = "default", size = "sm", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50",
    danger: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800/50",
    info: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50",
    purple: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 border border-violet-200 dark:border-violet-800/50",
    outline: "border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] font-medium rounded-md gap-1",
    md: "px-2.5 py-1 text-xs font-semibold rounded-md gap-1.5",
  };

  return (
    <span className={cn("inline-flex items-center tracking-wide", variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
