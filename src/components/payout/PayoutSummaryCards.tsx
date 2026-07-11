"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Wallet, TrendingUp, Clock } from "lucide-react";
import { useRef } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { useToast } from "@/components/ui/ToastProvider";

const API = "/backend";

type PayoutChartItem = {
  label: string;
  value: number;
  color: string;
};

type PayoutChartResponse = {
  total: number;
  breakdown: PayoutChartItem[];
};

type StatsResponse = {
  result: {
    totalWalletBalance: number;
    totalPayout: number;
    totalPaymentsProcessed: number;
  };
};

export function PayoutSummaryCards() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { notify } = useToast();
  const [stats, setStats] = useState<StatsResponse["result"] | null>(null);
  const [chart, setChart] = useState<PayoutChartResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, chartRes] = await Promise.all([
        authFetch(`${API}/dashboard/stats`, { headers: { Authorization: `Bearer ${typeof window !== "undefined" ? (localStorage.getItem("authToken") || localStorage.getItem("token") || "") : ""}` } }),
        authFetch(`${API}/dashboard/payout-chart`, { headers: { Authorization: `Bearer ${typeof window !== "undefined" ? (localStorage.getItem("authToken") || localStorage.getItem("token") || "") : ""}` } }),
      ]);

      const statsJson = await statsRes.json().catch(() => ({}));
      const chartJson = await chartRes.json().catch(() => ({}));

      if (statsRes.ok && statsJson.result) {
        setStats(statsJson.result);
      } else {
        notify(statsJson.data || "Failed to load payout stats");
      }

      if (chartRes.ok && chartJson.result) {
        setChart(chartJson.result);
      } else {
        notify(chartJson.data || "Failed to load payout breakdown");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") notify("Error loading payout data");
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: "smooth" });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="relative">
        <div className="hidden md:grid md:grid-cols-3 md:gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-white/10 rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-white/10 rounded w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="md:hidden">
          <div className="flex gap-4 overflow-x-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="flex-shrink-0 w-80 rounded-none animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-white/10 rounded w-24" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-white/10 rounded w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalPayout = stats?.totalPayout ?? 0;
  const walletBalance = stats?.totalWalletBalance ?? 0;
  const totalPaymentsProcessed = stats?.totalPaymentsProcessed ?? 0;

  const pendingPayout = chart?.breakdown?.find((b) => b.label === "Pending payout")?.value ?? 0;
  const currentPendingInterval = chart?.breakdown?.find((b) => b.label === "Current pending interval")?.value ?? 0;

  return (
    <div className="relative">
      {/* Desktop Grid Layout */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <Wallet className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Total Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPayout)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingPayout)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Current Pending Interval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentPendingInterval)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Scrollable Layout */}
      <div className="md:hidden relative">
        <div className="border-t border-border my-4" />
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border border-border rounded-full p-2 shadow-lg hover:bg-accent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border border-border rounded-full p-2 shadow-lg hover:bg-accent transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          <Card className="flex-shrink-0 w-80 rounded-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Payout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPayout)}</div>
            </CardContent>
          </Card>
          <Card className="flex-shrink-0 w-80 rounded-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(pendingPayout)}</div>
            </CardContent>
          </Card>
          <Card className="flex-shrink-0 w-80 rounded-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Pending Interval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(currentPendingInterval)}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
