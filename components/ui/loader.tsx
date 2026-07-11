"use client";

import React from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   Variants
   • "bars"    – equalizer bars (default, compact)
   • "orbit"   – orbiting ring with pulse core
   • "page"    – full-screen overlay with logo
───────────────────────────────────────────── */

type LoaderVariant = "bars" | "orbit" | "page";
type LoaderSize = "sm" | "md" | "lg";

interface LoaderProps {
  variant?: LoaderVariant;
  size?: LoaderSize;
  label?: string;
  className?: string;
}

const SIZE = {
  sm: { orbit: 32, bar: "h-3 w-1", gap: "gap-[3px]" },
  md: { orbit: 48, bar: "h-5 w-1.5", gap: "gap-1" },
  lg: { orbit: 64, bar: "h-7 w-2", gap: "gap-1.5" },
};

/* ── Equalizer bars ─────────────────────── */
function BarsLoader({ size = "md", label, className }: Omit<LoaderProps, "variant">) {
  const s = SIZE[size];
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className={cn("flex items-end", s.gap)}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              "rounded-full bg-violet-500 animate-loader-bar",
              s.bar,
            )}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      {label && <p className="text-xs text-muted-foreground tracking-wide">{label}</p>}
    </div>
  );
}

/* ── Orbit ring ─────────────────────────── */
function OrbitLoader({ size = "md", label, className }: Omit<LoaderProps, "variant">) {
  const d = SIZE[size].orbit;
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div style={{ width: d, height: d }} className="relative flex items-center justify-center">
        {/* outer spinning ring */}
        <svg
          className="absolute inset-0 animate-spin"
          style={{ animationDuration: "1.4s" }}
          viewBox="0 0 48 48"
          fill="none"
        >
          <circle cx="24" cy="24" r="20" stroke="#3a3a40" strokeWidth="3" />
          <path
            d="M24 4 A20 20 0 0 1 44 24"
            stroke="url(#orbit-grad)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="orbit-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
          </defs>
        </svg>
        {/* pulsing core */}
        <span className="rounded-full bg-violet-600 animate-pulse" style={{ width: d * 0.3, height: d * 0.3 }} />
      </div>
      {label && <p className="text-xs text-muted-foreground tracking-wide">{label}</p>}
    </div>
  );
}

/* ── Full-page overlay ──────────────────── */
function PageLoader({ label = "Loading…" }: Pick<LoaderProps, "label">) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
      {/* stacked rings */}
      <div className="relative flex items-center justify-center w-20 h-20 mb-6">
        {/* ring 1 */}
        <span className="absolute inset-0 rounded-full border-2 border-violet-500/20 animate-ping" style={{ animationDuration: "1.8s" }} />
        {/* ring 2 */}
        <span className="absolute inset-2 rounded-full border-2 border-violet-400/30 animate-ping" style={{ animationDuration: "1.4s", animationDelay: "0.3s" }} />
        {/* spinner arc */}
        <svg className="absolute inset-0 animate-spin w-20 h-20" style={{ animationDuration: "1.2s" }} viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="36" stroke="#3a3a40" strokeWidth="2.5" />
          <path d="M40 4 A36 36 0 0 1 76 40" stroke="url(#page-grad)" strokeWidth="2.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="page-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
          </defs>
        </svg>
        {/* core dot */}
        <span className="w-4 h-4 rounded-full bg-violet-500 shadow-lg shadow-violet-500/50 animate-pulse" />
      </div>

      {/* bar strip */}
      <div className="flex items-end gap-1 mb-4">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <span
            key={i}
            className="w-1.5 rounded-full bg-violet-500 animate-loader-bar"
            style={{ animationDelay: `${i * 0.08}s`, height: 20 }}
          />
        ))}
      </div>

      <p className="text-sm text-muted-foreground tracking-widest uppercase animate-pulse">{label}</p>
    </div>
  );
}

/* ── Public API ─────────────────────────── */
export function Loader({ variant = "bars", size = "md", label, className }: LoaderProps) {
  if (variant === "page") return <PageLoader label={label} />;
  if (variant === "orbit") return <OrbitLoader size={size} label={label} className={className} />;
  return <BarsLoader size={size} label={label} className={className} />;
}

/* convenience re-exports */
export { PageLoader, OrbitLoader, BarsLoader };
