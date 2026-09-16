"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWalletBalance, type WalletEntry } from "@/hooks/use-wallet-balance";
import { authFetch } from "@/lib/auth-fetch";
import { cccNetwork } from "@/lib/ccc-config";
import type { UserWallet } from "@/types";

type AvailableAsset = {
  currency_id: string;
  crypto?: { symbol?: string };
  network?: { name?: string; isTestnet?: boolean; networkType?: string };
};

type DashboardStatsResponse = {
  error?: boolean;
  data?: string;
  result?: {
    totalWalletBalance?: number;
  };
};

function WithdrawButton() {
  const router = useRouter();
  return (
    <Button
      variant="default"
      size="sm"
      className="px-3 py-1 hidden md:inline-flex"
      onClick={() => router.push('/dashboard/wallet/withdraw')}
    >
      Withdraw
    </Button>
  );
}

function WalletCard({ wallet, onClick }: { wallet: UserWallet; onClick?: () => void }) {
  const network = wallet.cryptoNetwork;
  const currency = wallet.currency;
  const iconSrc = network?.logo || currency?.logo || "/images/usdcbase.png";
  const symbol = currency?.symbol || "?";
  const address = wallet.walletAddress || "";
  const truncated = address.length > 10 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;

  return (
    <Card className="cursor-pointer hover:border-primary/60 transition-colors" onClick={onClick}>
      <CardHeader className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <img src={iconSrc} alt={network?.name || "Network"} className="w-6 h-6 rounded-full" />
          <CardTitle className="text-sm font-medium">{network?.name || "Wallet"}</CardTitle>
        </div>
        <WithdrawButton />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof wallet.balance === "number" ? wallet.balance.toLocaleString() : "—"} {symbol}
        </div>
        <div className="text-xs text-muted-foreground mt-1 font-mono">
          {truncated || "No address"}
        </div>
        {network?.isTestnet && (
          <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/25">
            Testnet
          </span>
        )}
      </CardContent>
    </Card>
  );
}

export function WalletSummaryCards() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const liveBalance = useWalletBalance();
  const router = useRouter();
  const [provisioning, setProvisioning] = useState(true);
  const [provisionError, setProvisionError] = useState<string | null>(null);
  const [totalWalletBalance, setTotalWalletBalance] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const refresh = () => setRefreshKey((value) => value + 1);
    window.addEventListener("dashboard:refresh", refresh);
    return () => window.removeEventListener("dashboard:refresh", refresh);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadDashboardBalance() {
      try {
        const token =
          localStorage.getItem("authToken") || localStorage.getItem("token");
        const response = await authFetch("/backend/dashboard/stats", {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => null)) as DashboardStatsResponse | null;
        if (!response.ok || payload?.error || !payload?.result) {
          throw new Error(payload?.data || "Unable to load wallet balance.");
        }
        if (mounted) {
          setTotalWalletBalance(Number(payload.result.totalWalletBalance || 0));
          setBalanceError(null);
        }
      } catch (error: unknown) {
        if (mounted) {
          setBalanceError(
            error instanceof Error ? error.message : "Unable to load wallet balance."
          );
        }
      }
    }

    loadDashboardBalance();
    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  useEffect(() => {
    let mounted = true;

    async function provisionCkbWallet() {
      try {
        const token =
          localStorage.getItem("authToken") || localStorage.getItem("token");
        if (!token) return;

        const assetsResponse = await authFetch("/backend/available-assets", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
        });
        const assetsPayload = await assetsResponse.json().catch(() => null);
        if (!assetsResponse.ok || assetsPayload?.error) {
          throw new Error(
            assetsPayload?.data || "Unable to load available wallet assets."
          );
        }

        const assets = (assetsPayload?.data || assetsPayload?.result || []) as AvailableAsset[];
        const expectedIsTestnet = cccNetwork === "testnet";
        const ckbAsset = assets.find((asset) => {
          const symbol = asset.crypto?.symbol?.toUpperCase();
          const networkType = asset.network?.networkType?.toLowerCase() || "";
          return (
            symbol === "CKB" &&
            networkType === "ckb" &&
            asset.network?.isTestnet === expectedIsTestnet
          );
        });

        if (!ckbAsset) {
          const networkLabel = expectedIsTestnet ? "testnet" : "mainnet";
          throw new Error(`No CKB ${networkLabel} currency is available for provisioning.`);
        }

        const provisionResponse = await authFetch("/backend/user/wallet/provision", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify({ currency_id: ckbAsset.currency_id }),
          cache: "no-store",
        });
        const provisionPayload = await provisionResponse.json().catch(() => null);
        if (!provisionResponse.ok || provisionPayload?.error || !provisionPayload?.result) {
          throw new Error(
            provisionPayload?.data || "Unable to provision the CKB wallet."
          );
        }

        window.dispatchEvent(new Event("dashboard:refresh"));
      } catch (error: unknown) {
        if (mounted) {
          setProvisionError(
            error instanceof Error ? error.message : "Unable to provision the CKB wallet."
          );
        }
      } finally {
        if (mounted) setProvisioning(false);
      }
    }

    provisionCkbWallet();
    return () => {
      mounted = false;
    };
  }, []);

  const wallets: UserWallet[] = useMemo(() => {
    if (!liveBalance?.wallets?.length) return [];
    return liveBalance.wallets.map((w: WalletEntry) => ({
      uniqueId: w.currency_id || w.symbol || "",
      walletAddress: "",
      balance: w.balance_usd || 0,
      status: "active",
      currencyId: w.currency_id || "",
      cryptoNetworkId: "",
      currency: { id: w.currency_id || "", symbol: w.symbol || "", name: w.symbol || "" },
      cryptoNetwork: { id: "", name: w.symbol || "", networkType: "evm", chainKey: "", isTestnet: false },
    }));
  }, [liveBalance]);

  const totalUsd = totalWalletBalance ?? liveBalance?.total_balance_usd ?? 0;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      {provisioning && (
        <p className="mb-3 text-sm text-muted-foreground">
          Preparing your CKB {cccNetwork} wallet...
        </p>
      )}
      {provisionError && (
        <p className="mb-3 text-sm text-destructive">{provisionError}</p>
      )}
      {balanceError && (
        <p className="mb-3 text-sm text-destructive">{balanceError}</p>
      )}
      {/* Navigation Buttons - Mobile Only */}
      {wallets.length > 1 && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border border-border rounded-full p-2 shadow-lg hover:bg-accent transition-colors md:hidden"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border border-border rounded-full p-2 shadow-lg hover:bg-accent transition-colors md:hidden"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Desktop: Grid Layout */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance (USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalUsd.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{wallets.length} wallet{wallets.length !== 1 ? "s" : ""}</div>
          </CardContent>
        </Card>
        {wallets.slice(0, 2).map(w => (
          <WalletCard key={w.uniqueId} wallet={w} onClick={() => router.push('/dashboard/wallet/withdraw')} />
        ))}
        {wallets.length === 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Wallets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs text-muted-foreground">No wallets found</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile: Scrollable Cards Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 md:hidden"
      >
        <Card className="flex-shrink-0 w-72">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance (USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalUsd.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{wallets.length} wallet{wallets.length !== 1 ? "s" : ""}</div>
          </CardContent>
        </Card>
        {wallets.map(w => (
          <WalletCard key={w.uniqueId} wallet={w} onClick={() => router.push('/dashboard/wallet/withdraw')} />
        ))}
      </div>
    </div>
  );
}
