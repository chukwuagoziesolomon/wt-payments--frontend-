"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Search, Loader2, AlertCircle } from "lucide-react";
import type { AssetItem } from "@/app/(dashboard)/dashboard/currency/page";
import { useToast } from "@/components/ui/ToastProvider";
import { usePrices } from "@/lib/usePrices";

const PAGE_SIZE = 10;

function truncateAddress(addr?: string) {
  if (!addr) return "—";
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
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

export function CurrencyTable({ assets, loading, error, search, onSearchChange }: Props) {
  const { notify } = useToast();
  const [page, setPage] = useState(1);
  const { getPrice, loading: pricesLoading } = usePrices();

  const totalPages = Math.max(1, Math.ceil(assets.length / PAGE_SIZE));
  const paged = assets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    notify("Address copied!");
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => { onSearchChange(e.target.value); setPage(1); }}
            placeholder="Search token or network..."
            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#9d8df1] transition-colors"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#0C0E10]">
                <TableRow>
                  <TableHead className="pl-4">Asset</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Contract Address</TableHead>
                  <TableHead>Rate (USD)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading assets...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!loading && error && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-destructive text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!loading && !error && paged.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground text-sm">
                      {search ? `No assets match "${search}"` : "No assets available"}
                    </TableCell>
                  </TableRow>
                )}
                {!loading && !error && paged.map((asset) => {
                  const address = asset.crypto?.contractAddress || asset.network?.contract_address;
                  const active = asset.is_active !== false;
                  const livePrice = getPrice(asset.crypto.symbol);
                  const displayRate = livePrice ?? asset.crypto.ratePerUsd;
                  return (
                    <TableRow key={asset.currency_id}>
                      <TableCell className="py-4 pl-4">
                        <div className="flex items-center gap-3">
                          {asset.crypto.logo ? (
                            <img
                              src={asset.crypto.logo}
                              alt={asset.crypto.symbol}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#23242A] flex items-center justify-center text-xs font-bold text-white/50">
                              {asset.crypto.symbol.slice(0, 2)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm text-white">{asset.crypto.symbol}</p>
                            <p className="text-xs text-muted-foreground">{asset.crypto.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#23242A] text-xs text-white/70 font-mono">
                          {asset.network?.name || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        {address ? (
                          <button
                            onClick={() => handleCopy(address)}
                            className="flex items-center gap-1.5 text-[#9d8df1] hover:text-[#b8a4f9] transition-colors group"
                            title={address}
                          >
                            <span className="font-mono text-sm">{truncateAddress(address)}</span>
                            <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-sm text-white">
                          {pricesLoading ? "..." : formatRate(displayRate)}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${active ? "bg-emerald-400" : "bg-zinc-500"}`} />
                          <span className={`text-sm ${active ? "text-emerald-400" : "text-zinc-400"}`}>
                            {active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && !error && assets.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground">
              <span>
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, assets.length)}–
                {Math.min(page * PAGE_SIZE, assets.length)} of {assets.length} assets
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2 py-1 rounded border border-border hover:bg-muted disabled:opacity-40 transition-colors"
                >
                  ‹
                </button>
                <span className="px-2 py-1 rounded border border-border bg-background">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-2 py-1 rounded border border-border hover:bg-muted disabled:opacity-40 transition-colors"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
