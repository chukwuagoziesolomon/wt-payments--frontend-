"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Filter, Search, ChevronRight } from "lucide-react";
import { getPaymentIntentHistory, type HistoryListItem } from "@/lib/payment-intent-history";

const PAGE_SIZE = 3;

function MobileList({
  transactions,
  loading,
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  transactions: HistoryListItem[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <Card className="md:hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Transactions</CardTitle>
        <button
          onClick={() => {
            window.location.href = "/dashboard/transactions";
          }}
          className="text-xs text-muted-foreground"
        >
          View All &gt;
        </button>
      </CardHeader>
      <CardContent>
        {/* Search + Filter */}
        <div className="flex items-center gap-2 mb-3">
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

        {loading ? (
          <div className="text-sm text-muted-foreground py-6">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6">No transactions found.</div>
        ) : (
          <ul className="flex flex-col gap-4">
            {transactions.map((tx) => (
              <li key={tx.id} className="flex items-start justify-between py-4 px-3">
              <div className="flex-1 pr-3">
                <div className="text-base font-medium">{tx.customer}</div>
                <div className="mt-1 flex items-center gap-1 text-sm text-blue-300">
                  <span>{tx.walletAddress}</span>
                  <Copy className="h-3.5 w-3.5" />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{tx.paidOn}</div>
              </div>
              <div className="text-right">
                <div className="text-base font-semibold">{tx.amountDisplay}</div>
                <div className="mt-2">
                  <Badge className={`${tx.statusClass} px-2 py-0.5 text-xs`}>
                    {tx.statusLabel}
                  </Badge>
                </div>
              </div>
            </li>
            ))}
          </ul>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 mt-3 text-xs text-muted-foreground">
            <span>Page {page + 1} of {totalPages}</span>
            <button
              onClick={onPrev}
              disabled={page === 0}
              className="px-2 py-1 bg-background border border-border rounded disabled:opacity-40"
            >
              &lt;
            </button>
            <button
              onClick={onNext}
              disabled={page >= totalPages - 1}
              className="px-2 py-1 bg-background border border-border rounded disabled:opacity-40"
            >
              &gt;
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DesktopTable({
  transactions,
  loading,
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  transactions: HistoryListItem[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <Card className="hidden md:block">
      <CardHeader className="pb-2">
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">Transaction</CardTitle>
          <button
            className="flex items-center gap-2"
            onClick={() => {
              window.location.href = "/dashboard/transactions";
            }}
          >
            <span className="text-sm text-muted-foreground">View All</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="w-full h-px bg-border mt-2"></div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search"
                className="bg-background border border-border rounded pl-9 pr-3 py-1 text-sm w-full"
              />
            </div>
            <button className="flex items-center gap-1 bg-background border border-border rounded px-3 py-1 text-sm">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
          <button className="ml-auto bg-background border border-border rounded px-3 py-1 text-sm flex items-center gap-1">
            Export CSV <span className="ml-1">↗</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#0C0E10]">
                <TableHead className="text-foreground">Paid on</TableHead>
                <TableHead className="text-foreground">Method</TableHead>
                <TableHead className="text-foreground">Crypto Currency</TableHead>
                <TableHead className="text-foreground">Wallet</TableHead>
                <TableHead className="text-foreground">Amount</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              )}
              {!loading && transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
              {!loading && transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-foreground py-4 px-3">{tx.paidOn}</TableCell>
                  <TableCell className="text-foreground py-4 px-3">Crypto</TableCell>
                  <TableCell className="text-foreground py-4 px-3">{tx.currencyDisplay}</TableCell>
                  <TableCell className="text-foreground py-4 px-3">
                    <div className="flex items-center gap-1">
                      <span className="text-blue-300 cursor-pointer">{tx.walletAddress}</span>
                      <Copy className="w-3 h-3 cursor-pointer" />
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground py-4 px-3">{tx.amountDisplay}</TableCell>
                  <TableCell className="text-foreground py-4 px-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${tx.statusClass}`}>{tx.statusLabel}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 text-xs text-muted-foreground">
          <span>Showing {transactions.length} entries</span>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <span>Page</span>
            <span className="px-2 py-1 bg-background border border-border rounded">{page + 1}</span>
            <span>of {totalPages}</span>
            <button
              onClick={onPrev}
              disabled={page === 0}
              className="px-2 py-1 bg-background border border-border rounded disabled:opacity-40"
            >
              &lt;
            </button>
            <button
              onClick={onNext}
              disabled={page >= totalPages - 1}
              className="px-2 py-1 bg-background border border-border rounded disabled:opacity-40"
            >
              &gt;
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TransactionsTable() {
  const [allItems, setAllItems] = React.useState<HistoryListItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    async function loadHistory() {
      setLoading(true);
      try {
        const { items } = await getPaymentIntentHistory();
        if (mounted) {
          setAllItems(items);
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

  const totalPages = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE));
  const pageItems = allItems.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handlePrev = () => setPage((p) => Math.max(0, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <div>
      <MobileList
        transactions={pageItems}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPrev={handlePrev}
        onNext={handleNext}
      />
      <DesktopTable
        transactions={pageItems}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}
