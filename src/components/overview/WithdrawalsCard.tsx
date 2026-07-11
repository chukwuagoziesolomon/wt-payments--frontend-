"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

interface HistoryItem {
  id: number | string;
  uniqueId?: string;
  usdtAmount?: number;
  nairaAmount?: number;
  recipientName?: string;
  recipientAccountNumber?: string;
  recipientType?: string;
  status?: string;
  initiatedAt?: string;
}

export function WithdrawalsCard() {
  const [withdrawals, setWithdrawals] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const apiBase = "/backend";
        const token = localStorage.getItem("authToken") || localStorage.getItem("token") || "";
        const res = await authFetch(`${apiBase}/user/withdrawals/history?page=1&limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const json = await res.json();

        if (!res.ok) throw new Error(json?.message || "Failed to load withdrawals");
        const items = json?.data?.data || [];

        if (active) setWithdrawals(items);
      } catch (err: any) {
        if (active) setError(err.message || "Failed to load withdrawals");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Withdrawals</CardTitle>
        <Link href="/dashboard/wallet" className="text-xs text-muted-foreground flex items-center gap-1">
          View All <span className="ml-1">&gt;</span>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {loading && <div className="text-sm text-muted-foreground">Loading recent withdrawals…</div>}
          {error && <div className="text-sm text-destructive">{error}</div>}
          {!loading && !error && withdrawals.length === 0 && (
            <div className="text-sm text-muted-foreground">No recent withdrawals yet.</div>
          )}
          {withdrawals.map((w) => (
            <div key={w.id} className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-sm">
                  {w.initiatedAt ? new Date(w.initiatedAt).toLocaleDateString() : "Recent withdrawal"}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <img src="/images/usdtasset.png" alt="USDT" className="w-6 h-6 rounded-full" />
                  <div className="text-xs text-muted-foreground">{w.recipientType || "USDT withdrawal"}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-medium text-sm ${w.status === "completed" ? "text-emerald-400" : "text-red-400"}`}>
                  {typeof w.usdtAmount === "number" ? `-${w.usdtAmount} USDT` : "-"}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                  {w.recipientAccountNumber || w.recipientName || "Wallet"}
                  <Copy className="w-3 h-3 cursor-pointer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
