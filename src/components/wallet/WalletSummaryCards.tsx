"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWalletBalance, type WalletEntry } from "@/hooks/use-wallet-balance";
import type { UserWallet } from "@/types";

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

  const totalUsd = liveBalance?.total_balance_usd ?? 0;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
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
