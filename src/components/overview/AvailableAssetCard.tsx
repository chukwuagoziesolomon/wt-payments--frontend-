"use client"

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { SectionLoader } from "@/components/ui/LoadingAnimator";
import { authFetch } from "@/lib/auth-fetch";

type AssetItem = {
  currency_id: string;
  crypto: {
    id: string;
    name: string;
    symbol: string;
    logo?: string;
    ratePerUsd?: number;
  };
  network?: any;
};

export function AvailableAssetCard() {
  const [assets, setAssets] = React.useState<AssetItem[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const apiBase = "/backend";
        const token = localStorage.getItem("authToken") || localStorage.getItem("token") || null;
        const headers: Record<string,string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await authFetch(`${apiBase}/available-assets`, { headers });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error((data && data.message) || `Status ${res.status}`);
        if (mounted) setAssets(data.data || []);
      } catch (err: any) {
        if (mounted) setError(err.message || "Failed to load assets");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Available Asset</CardTitle>
        <Link href="/dashboard/currency" className="text-xs text-muted-foreground flex items-center gap-1">
          View all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {loading && <SectionLoader variant="orbit" message="Loading assets…" height={120} />}
          {error && <div className="text-sm text-destructive">{error}</div>}
          {!loading && !error && assets && assets.length === 0 && (
            <div className="text-sm text-muted-foreground">No assets available</div>
          )}

          {assets && assets.map((asset) => (
            <Link key={asset.currency_id} href="/dashboard/currency" className="flex items-center justify-between hover:bg-muted/5 p-2 rounded">
              <div className="flex items-center gap-2">
                <img src={asset.crypto.logo || '/images/usdcbase.png'} alt={asset.crypto.symbol} className="w-8 h-8 rounded-full" />
                <div>
                  <div className="font-medium">{asset.crypto.symbol}</div>
                  <div className="text-xs text-muted-foreground">{asset.crypto.name}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-medium">{asset.crypto.ratePerUsd ? `$${asset.crypto.ratePerUsd.toFixed(2)}` : '-'}</div>
                  <div className="text-xs text-muted-foreground">{asset.network?.name ?? ''}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
