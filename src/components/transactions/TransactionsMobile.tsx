"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Filter, Search } from "lucide-react";
import { DetailsSheet } from "../DetailsSheet";
import { DetailsData } from "@/types";
import { getPaymentIntentHistory, type HistoryListItem } from "@/lib/payment-intent-history";
import { SectionLoader } from "@/components/ui/LoadingAnimator";

export function TransactionsMobile() {
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<DetailsData | null>(null);
  const [items, setItems] = useState<HistoryListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadHistory() {
      setLoading(true);
      try {
        const { items: historyItems } = await getPaymentIntentHistory();
        if (mounted) {
          setItems(historyItems);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadHistory();
    return () => {
      mounted = false;
    };
  }, []);

  const months = useMemo(() => {
    const grouped: Record<string, HistoryListItem[]> = {};

    for (const item of items) {
      const rawDate = new Date(item.createdAt);
      const monthKey = Number.isNaN(rawDate.getTime())
        ? "Unknown"
        : rawDate.toLocaleDateString(undefined, {
            month: "short",
            year: "numeric",
          });
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(item);
    }

    return Object.entries(grouped).map(([month, monthItems]) => ({
      month,
      items: monthItems,
    }));
  }, [items]);

  const handleItemClick = (tx: HistoryListItem) => {
    setSelectedData(tx.details);
    setOpen(true);
  };

  return (
    <div className="md:hidden relative pb-24">
      {/* Search + Filter */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-background border border-border rounded pl-9 pr-3 py-2 text-sm"
          />
        </div>
        <button className="h-10 w-10 flex items-center justify-center rounded-md border border-border">
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {loading && <SectionLoader variant="bars" message="Loading transactions…" height={120} />}
      {!loading && months.length === 0 && (
        <div className="text-sm text-muted-foreground py-6">No additional transactions to display.</div>
      )}

      {!loading && months.map((m) => (
        <Card key={m.month} className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">{m.month}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="flex flex-col gap-4">
              {m.items.map((tx) => (
                <li key={tx.id} className="flex items-start justify-between cursor-pointer hover:bg-gray-800 py-4 px-3 rounded" onClick={() => handleItemClick(tx)}>
                  <div className="flex-1 pr-3">
                    <div className="text-base font-medium">{tx.customer}</div>
                    <div className="mt-1 flex items-center gap-1 text-[13px] text-blue-300">
                      <span>{tx.walletAddress}</span>
                      <Copy className="h-3.5 w-3.5" />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{tx.paidOn}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-semibold">{tx.amountDisplay}</div>
                    <div className="mt-2">
                      <Badge className={`${tx.statusClass} px-2 py-0.5 text-xs`}>{tx.statusLabel}</Badge>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}

      {/* Mobile bottom action */}
      <div className="fixed inset-x-0 bottom-0 z-30 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t border-border p-4">
        <button onClick={() => (window.location.href = '/transactions/create')} className="w-full h-12 rounded-md bg-primary text-primary-foreground text-base font-medium">Create Transaction</button>
      </div>
      <DetailsSheet open={open} onOpenChange={setOpen} data={selectedData} />
    </div>
  );
}
