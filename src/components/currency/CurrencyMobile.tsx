"use client";

import React from "react";
import { Copy, Search, Loader2, AlertCircle } from "lucide-react";
import type { AssetItem } from "@/app/(dashboard)/dashboard/currency/page";
import { useToast } from "@/components/ui/ToastProvider";
import { usePrices } from "@/lib/usePrices";

function truncateAddress(addr?: string) {
  if (!addr) return null;
  if (addr.length <= 18) return addr;
  return `${addr.slice(0, 10)}…${addr.slice(-6)}`;
}

function formatRate(value: number | undefined): string {
  if (value == null) return "—";
  if (value >= 1) return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (value >= 0.01) return `$${value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}`;
}

type Props = {
  assets: AssetItem[];
  loading: boolean;
  error: string | null;
  search: string;
  onSearchChange: (v: string) => void;
};

export function CurrencyMobile({ assets, loading, error, search, onSearchChange }: Props) {
  const { notify } = useToast();
  const { getPrice, loading: pricesLoading } = usePrices();

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    notify("Address copied!");
  };

  return (
    <div className="md:hidden">
      <p className="text-sm text-muted-foreground mb-4">
        Supported assets and networks you can accept payments in
      </p>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search token or network..."
          className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#9d8df1] transition-colors"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading assets...</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-2 py-8 text-destructive text-sm justify-center">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && assets.length === 0 && (
        <div className="text-center py-10 text-muted-foreground text-sm">
          {search ? `No assets match "${search}"` : "No assets available"}
        </div>
      )}

      {/* Cards */}
      {!loading && !error && (
        <div className="flex flex-col gap-3">
          {assets.map((asset) => {
            const active = asset.is_active !== false;
            const address = asset.network?.contract_address;
            const livePrice = getPrice(asset.crypto.symbol);
            const displayRate = livePrice ?? asset.crypto.ratePerUsd;
            return (
              <div
                key={asset.currency_id}
                className="rounded-2xl bg-card px-4 py-4 border border-border"
              >
                {/* Top row: logo + name + status badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {asset.crypto.logo ? (
                      <img
                        src={asset.crypto.logo}
                        alt={asset.crypto.symbol}
                        className="h-10 w-10 rounded-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-[#23242A] flex items-center justify-center text-sm font-bold text-white/40">
                        {asset.crypto.symbol.slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-white">{asset.crypto.symbol}</p>
                      <p className="text-xs text-muted-foreground">{asset.crypto.name}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                          : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/25"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-zinc-500"}`} />
                      {active ? "Active" : "Inactive"}
                    </span>
                    {displayRate != null && (
                      <span className="text-xs text-white/60 font-mono">
                        {pricesLoading ? "..." : formatRate(displayRate)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Network badge */}
                {asset.network?.name && (
                  <div className="mt-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#23242A] text-xs text-white/60 font-mono border border-white/[0.06]">
                      {asset.network.name}
                    </span>
                  </div>
                )}

                {/* Contract address */}
                {address && (
                  <button
                    onClick={() => handleCopy(address)}
                    className="mt-3 flex items-center gap-2 text-[#9d8df1] hover:text-[#b8a4f9] transition-colors group w-full"
                    title={address}
                  >
                    <span className="font-mono text-sm truncate">{truncateAddress(address)}</span>
                    <Copy className="h-4 w-4 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

