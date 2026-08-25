"use client";

import { Image } from "lucide-react";

type TreasuryCardProps = {
  small?: boolean;
  productName?: string;
  category?: string;
  price?: string;
  stock?: number;
  isActive?: boolean;
  imageCount?: number;
};

export function TreasuryCard({
  small = false,
  productName = "WesternTreasury",
  category = "Obsidian",
  price,
  stock,
  isActive = true,
  imageCount = 0,
}: TreasuryCardProps) {
  const isProductCard = price !== undefined || stock !== undefined;

  return (
    <div
      className={`relative ${small ? "w-full max-w-[260px]" : "w-full max-w-[380px]"} aspect-[1.586] rounded-2xl bg-violet-gradient shadow-cardGlow overflow-hidden select-none`}
    >
      <div className="absolute -inset-1 bg-[radial-gradient(120%_60%_at_10%_0%,rgba(255,255,255,0.35),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(0,0,0,0.25)_100%)] pointer-events-none" />

      <div className="relative h-full w-full p-5 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="text-white/90 font-semibold tracking-tight text-sm">
            {productName}
          </span>
          <span className={`text-xs uppercase tracking-[0.18em] ${isActive ? "text-white/70" : "text-white/40"}`}>
            {category}
          </span>
        </div>

        <div>
          <div className="w-9 h-7 rounded-[5px] bg-gradient-to-br from-amber-100 to-amber-300/80 mb-3 shadow-inner" />
          {isProductCard ? (
            <p className="font-mono tabular text-white/95 text-[15px] tracking-[0.12em]">
              {price}&nbsp;&nbsp;{stock !== undefined && <span className="text-white/50">· {stock} in stock</span>}
            </p>
          ) : (
            <p className="font-mono tabular text-white/95 text-[15px] tracking-[0.12em]">
              4291&nbsp;&nbsp;••••&nbsp;&nbsp;••••&nbsp;&nbsp;8402
            </p>
          )}
        </div>

        <div className="flex items-end justify-between">
          {isProductCard ? (
            <>
              <p className="text-white/55 text-[9px] uppercase tracking-[0.14em]">{category}</p>
              <p className="text-white/90 text-xs font-medium">{stock} in stock</p>
            </>
          ) : (
            <>
              <div>
                <p className="text-white/55 text-[9px] uppercase tracking-[0.14em]">Cardholder</p>
                <p className="text-white/90 text-xs font-medium">A. Chukwu</p>
              </div>
              <div className="flex items-center gap-[-6px]">
                <div className="w-6 h-6 rounded-full bg-white/85" />
                <div className="w-6 h-6 rounded-full bg-white/60 -ml-3" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
