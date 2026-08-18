"use client";

import { Copy, Filter, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionLoader } from "@/components/ui/LoadingAnimator";
import {
  getPaymentIntentHistory,
  type HistoryListItem,
} from "@/lib/payment-intent-history";
import type { DetailsData } from "@/types";
import { DetailsSheet } from "../DetailsSheet";

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
    <div className="relative pb-24 md:hidden">
      {/* Search + Filter */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full rounded border border-border bg-background py-2 pr-3 pl-9 text-sm"
            placeholder="Search"
            type="text"
          />
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-md border border-border">
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {loading && (
        <SectionLoader
          height={120}
          message="Loading transactions…"
          variant="bars"
        />
      )}
      {!loading && months.length === 0 && (
        <div className="py-6 text-muted-foreground text-sm">
          No additional transactions to display.
        </div>
      )}

      {!loading &&
        months.map((m) => (
          <Card className="mb-4" key={m.month}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-semibold text-base">
                  {m.month}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="flex flex-col gap-4">
                {m.items.map((tx) => (
                  <li
                    className="flex cursor-pointer items-start justify-between rounded px-3 py-4 hover:bg-gray-800"
                    key={tx.id}
                    onClick={() => handleItemClick(tx)}
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="truncate font-medium text-base">
                        {tx.customer}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-[13px] text-blue-300">
                        <span className="block min-w-0 max-w-[150px] truncate">
                          {tx.walletAddress}
                        </span>
                        <Copy className="h-3.5 w-3.5 flex-shrink-0" />
                      </div>
                      <div className="mt-1 truncate text-muted-foreground text-xs">
                        {tx.paidOn}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-base">
                        {tx.amountDisplay}
                      </div>
                      <div className="mt-2">
                        <Badge
                          className={`${tx.statusClass} px-2 py-0.5 text-xs`}
                        >
                          {tx.statusLabel}
                        </Badge>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}

      {/* Mobile bottom action */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-border border-t bg-background/90 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <button
          className="h-12 w-full rounded-md bg-primary font-medium text-base text-primary-foreground"
          onClick={() => (window.location.href = "/transactions/create")}
        >
          Create Transaction
        </button>
      </div>
      <DetailsSheet data={selectedData} onOpenChange={setOpen} open={open} />
    </div>
  );
}
