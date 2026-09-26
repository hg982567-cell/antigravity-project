"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { BrandLogo } from "./BrandLogo";

export function SplashAnimation() {
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Only show once per browser tab session, unless explicitly requested
    const shown = sessionStorage.getItem("ravan_splash_shown");
    if (!shown) {
      setVisible(true);
      sessionStorage.setItem("ravan_splash_shown", "true");

      const fadeTimer = setTimeout(() => {
        setFadingOut(true);
      }, 1600);

      const removeTimer = setTimeout(() => {
        setVisible(false);
      }, 2100);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, []);

  const handleSkip = () => {
    setFadingOut(true);
    setTimeout(() => {
      setVisible(false);
    }, 300);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="RAVAN SHIPPING Loading Screen"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 text-white transition-opacity duration-500 ${
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background ambient glowing orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-amber-500/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 px-3 py-1.5 rounded-full border border-slate-700/80 bg-slate-900/60 text-slate-300 hover:text-white hover:border-slate-500 text-xs font-mono tracking-wider transition-all cursor-pointer z-10"
      >
        SKIP &rarr;
      </button>

      {/* 3D Container Stage */}
      <div className="relative flex flex-col items-center z-10 select-none">
        {/* CSS 3D Cube / Crest Animation */}
        <div className="relative w-28 h-28 mb-6 flex items-center justify-center" style={{ perspective: "1000px" }}>
          {/* Outer Pulsing Hexagon Ring */}
          <div className="absolute inset-0 rounded-3xl border-2 border-blue-500/40 animate-ping opacity-25" />
          <div className="absolute -inset-2 rounded-3xl border border-amber-500/30 rotate-45 animate-spin [animation-duration:12s]" />

          {/* 3D Isometric Card */}
          <div
            className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-400/80 shadow-[0_0_40px_rgba(245,158,11,0.25)] flex items-center justify-center transform transition-transform duration-700 hover:scale-105"
            style={{
              transform: "rotateX(15deg) rotateY(-15deg)",
              transformStyle: "preserve-3d",
            }}
          >
            <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-inner flex items-center justify-center bg-black/40">
              <Image
                src="/logo.png"
                alt="RAVAN SHIPPING Crest"
                width={64}
                height={64}
                priority
                className="object-contain filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]"
              />
            </div>
          </div>
        </div>

        {/* Brand Title */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-blue-400">
            RAVAN SHIPPING
          </h1>
          <p className="text-xs font-mono tracking-widest text-slate-400 uppercase">
            Global Logistics &amp; Dropshipping OS
          </p>
        </div>

        {/* Telemetry Progress Bar */}
        <div className="mt-8 w-48 h-1 bg-slate-800 rounded-full overflow-hidden relative">
          <div className="h-full bg-gradient-to-r from-amber-400 via-blue-500 to-emerald-400 rounded-full animate-[progress_1.6s_ease-in-out_infinite]" />
        </div>

        {/* System telemetry note */}
        <p className="mt-3 text-[10px] font-mono text-slate-500 tracking-wider">
          CARRIER TELEMETRY • AI RADAR • ACTIVE
        </p>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 70%;
            margin-left: 15%;
          }
          100% {
            width: 100%;
            margin-left: 0%;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-spin,
          .animate-ping,
          .animate-[progress_1.6s_ease-in-out_infinite] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
