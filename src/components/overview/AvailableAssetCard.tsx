"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, ChevronDown } from "lucide-react"
import { SectionLoader } from "@/components/ui/LoadingAnimator"
import { authFetch } from "@/lib/auth-fetch"
import { usePrices } from "@/lib/usePrices"

type AssetItem = {
  currency_id: string
  crypto: {
    id: string
    name: string
    symbol: string
    logo?: string
    ratePerUsd?: number
  }
  network?: any
}

const INITIAL_VISIBLE = 4

const ASSET_ICON_MAP: Record<string, string> = {
  CKB: "/images/ckb.png",
  USDT: "/images/usdtasset.png",
  USDC: "/images/usdcbase.png",
}

function getAssetIcon(symbol?: string, logo?: string, fallbackIndex = 0) {
  if (logo && logo.trim()) return logo
  const key = (symbol || "").toUpperCase().trim()
  if (ASSET_ICON_MAP[key]) return ASSET_ICON_MAP[key]
  const fallbacks = ["/images/usdcbase.png", "/images/usdtasset.png", "/images/ckb.png"]
  return fallbacks[Math.min(fallbackIndex, fallbacks.length - 1)]
}

function formatRate(value: number | undefined): string {
  if (value == null) return "-"
  if (value >= 1) return `$${value.toFixed(2)}`
  if (value >= 0.01) return `$${value.toFixed(4)}`
  return `$${value.toFixed(6)}`
}

export function AvailableAssetCard() {
  const [assets, setAssets] = React.useState<AssetItem[] | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showAll, setShowAll] = React.useState(false)

  const { prices, loading: pricesLoading, getPrice } = usePrices()

  React.useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const apiBase = "/backend"
        const token = localStorage.getItem("authToken") || localStorage.getItem("token") || null
        const headers: Record<string,string> = {}
        if (token) headers["Authorization"] = `Bearer ${token}`

        const res = await authFetch(`${apiBase}/available-assets`, { headers })
        const data = await res.json().catch(() => null)
        if (!res.ok) throw new Error((data && data.message) || `Status ${res.status}`)
        if (mounted) setAssets(data.data || [])
      } catch (err: any) {
        if (mounted) setError(err.message || "Failed to load assets")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false; }
  }, [])

  const visibleAssets = React.useMemo(() => {
    if (!assets) return []
    return showAll ? assets : assets.slice(0, INITIAL_VISIBLE)
  }, [assets, showAll])

  const hasMore = (assets?.length ?? 0) > INITIAL_VISIBLE

  const resolveRate = (asset: AssetItem): number | undefined => {
    const live = getPrice(asset.crypto.symbol)
    if (live != null) return live
    return asset.crypto.ratePerUsd
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-semibold text-base">Available Asset</CardTitle>
        <Link className="flex items-center gap-1 text-muted-foreground text-xs" href="/dashboard/currency">
          View all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {loading && <SectionLoader height={120} message="Loading assets…" variant="orbit" />}
          {error && <div className="text-destructive text-sm">{error}</div>}
          {!loading && !error && assets && assets.length === 0 && (
            <div className="text-muted-foreground text-sm">No assets available</div>
          )}

          {visibleAssets.map((asset, index) => (
            <Link className="flex items-center justify-between hover:bg-muted/5 p-2 rounded" href="/dashboard/currency" key={asset.currency_id}>
              <div className="flex items-center gap-2">
                <img
                  alt={asset.crypto.symbol}
                  className="w-8 h-8 rounded-full"
                  src={getAssetIcon(asset.crypto.symbol, asset.crypto.logo, index)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    const fallbacks = ["/images/ckb.png", "/images/usdtasset.png", "/images/usdcbase.png"]
                    const current = fallbacks.findIndex(f => target.src.includes(f))
                    if (current >= 0 && current < fallbacks.length - 1) {
                      target.src = fallbacks[current + 1]
                    } else {
                      target.style.display = "none"
                    }
                  }}
                />
                <div>
                  <div className="font-medium">{asset.crypto.symbol}</div>
                  <div className="text-muted-foreground text-xs">{asset.crypto.name}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-medium">{pricesLoading ? "..." : formatRate(resolveRate(asset))}</div>
                  <div className="text-muted-foreground text-xs">{asset.network?.name ?? ''}</div>
                </div>
                <ChevronRight className="text-muted-foreground w-4 h-4" />
              </div>
            </Link>
          ))}

          {hasMore && (
            <button
              className="flex items-center justify-center gap-1 text-muted-foreground hover:text-white transition-colors py-1 text-xs"
              onClick={() => setShowAll(v => !v)}
              type="button"
            >
              {showAll ? "Show less" : `Show more (${assets!.length - INITIAL_VISIBLE})`}
              <ChevronDown className={`transition-transform w-4 h-4 ${showAll ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
