"use client"

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, CircleDollarSign, Activity } from "lucide-react";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { authFetch } from "@/lib/auth-fetch";

type Stats = {
  totalWalletBalance: number;
  totalPayout: number;
  totalPaymentProcessed: number;
};

export function SummaryCards() {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const liveBalance = useWalletBalance();

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

        const res = await authFetch(`${apiBase}/dashboard/stats`, {
          method: "GET",
          headers,
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error((data && data.data) || `Status ${res.status}`);
        if (mounted) setStats(data.result || null);
      } catch (err: any) {
        if (mounted) setError(err.message || "Failed to load stats");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const formatCurrency = (v: number) => `$${v.toLocaleString()}`;

  // SSE overrides the initial wallet balance as soon as a live event arrives
  const walletBalanceDisplay =
    liveBalance != null
      ? formatCurrency(liveBalance.total_balance_usd)
      : loading
      ? "—"
      : stats
      ? formatCurrency(stats.totalWalletBalance)
      : error
      ? "Error"
      : "$0";

  return (
    <div>
      {/* Mobile: horizontal carousel */}
      <div className="md:hidden -mx-4 px-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="flex gap-4 snap-x snap-mandatory">
          <Card className="min-w-[260px] snap-start">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="w-4 h-4 text-purple-400" />
                Total Wallet Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{walletBalanceDisplay}</div>
              {error && <div className="text-sm text-destructive mt-2">{error}</div>}
            </CardContent>
          </Card>
          <Card className="min-w-[260px] snap-start">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CircleDollarSign className="w-4 h-4 text-yellow-400" />
                Total Payout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? "—" : stats ? formatCurrency(stats.totalPayout) : (error ? "Error" : "$0")}</div>
              {error && <div className="text-sm text-destructive mt-2">{error}</div>}
            </CardContent>
          </Card>
          <Card className="min-w-[260px] snap-start">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-400" />
                Total Payment Processed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? "—" : stats ? formatCurrency(stats.totalPaymentProcessed) : (error ? "Error" : "$0")}</div>
              {error && <div className="text-sm text-destructive mt-2">{error}</div>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Desktop: 3-column grid */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4 text-purple-400" />
              Total Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{walletBalanceDisplay}</div>
            {error && <div className="text-sm text-destructive mt-2">{error}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CircleDollarSign className="w-4 h-4 text-yellow-400" />
              Total Payout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "—" : stats ? formatCurrency(stats.totalPayout) : (error ? "Error" : "$0")}</div>
            {error && <div className="text-sm text-destructive mt-2">{error}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-400" />
              Total Payment Processed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "—" : stats ? formatCurrency(stats.totalPaymentProcessed) : (error ? "Error" : "$0")}</div>
            {error && <div className="text-sm text-destructive mt-2">{error}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
