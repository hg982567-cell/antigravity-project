"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  textClassName?: string;
  subtitle?: string;
  badge?: string;
  href?: string;
  className?: string;
}

const sizeMap = {
  xs: { img: 24, box: "w-6 h-6", text: "text-sm", sub: "text-[9px]" },
  sm: { img: 32, box: "w-8 h-8", text: "text-base", sub: "text-[10px]" },
  md: { img: 40, box: "w-10 h-10", text: "text-lg", sub: "text-[11px]" },
  lg: { img: 48, box: "w-12 h-12", text: "text-xl", sub: "text-xs" },
  xl: { img: 64, box: "w-16 h-16", text: "text-2xl", sub: "text-xs" },
};

export function BrandLogo({
  size = "md",
  showText = true,
  textClassName,
  subtitle,
  badge,
  href,
  className,
}: BrandLogoProps) {
  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 group select-none", className)}>
      <div
        className={cn(
          "relative shrink-0 rounded-xl overflow-hidden bg-slate-900 shadow-md shadow-blue-500/20 border border-blue-500/30 flex items-center justify-center transition-transform group-hover:scale-105",
          currentSize.box
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="RAVAN SHIPPING Logo"
          className="w-full h-full object-contain p-0.5"
          width={currentSize.img}
          height={currentSize.img}
        />
      </div>

      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "font-extrabold tracking-tight text-slate-900 dark:text-white uppercase font-sans",
                currentSize.text,
                textClassName
              )}
            >
              RAVAN <span className="text-blue-500 dark:text-blue-400">SHIPPING</span>
            </span>
            {badge && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <span className={cn("text-slate-500 dark:text-slate-400 font-medium", currentSize.sub)}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
