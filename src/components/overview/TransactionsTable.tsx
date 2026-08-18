"use client";

import { ChevronRight, Copy, Filter, Search } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DetailsModal } from "../DetailsModal";
import type { DetailsData } from "@/types";
import {
  getPaymentIntentHistory,
  type HistoryListItem,
} from "@/lib/payment-intent-history";

const PAGE_SIZE = 3;

type MobileListProps = {
  transactions: HistoryListItem[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onTransactionClick: (tx: HistoryListItem) => void;
};

function MobileList({
  transactions,
  loading,
  page,
  totalPages,
  onPrev,
  onNext,
  onTransactionClick,
}: MobileListProps) {
  return (
    <Card className="md:hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-semibold text-lg">Transactions</CardTitle>
        <button
          className="text-muted-foreground text-xs"
          onClick={() => {
            window.location.href = "/dashboard/transactions";
          }}
        >
          View All &gt;
        </button>
      </CardHeader>
      <CardContent>
        {/* Search + Filter */}
        <div className="mb-3 flex items-center gap-2">
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

        {loading ? (
          <div className="py-6 text-muted-foreground text-sm">
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-6 text-muted-foreground text-sm">
            No transactions found.
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {transactions.map((tx) => (
              <li
                className="cursor-pointer rounded px-3 py-4 flex items-start justify-between hover:bg-muted/5"
                key={tx.id}
                onClick={() => onTransactionClick(tx)}
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="truncate font-medium text-base">
                    {tx.customer}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-blue-300 text-sm">
                    <span className="min-w-0 truncate">{tx.walletAddress}</span>
                    <Copy className="h-3.5 w-3.5 flex-shrink-0" />
                  </div>
                  <div className="mt-1 truncate text-muted-foreground text-sm">
                    {tx.paidOn}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-base">
                    {tx.amountDisplay}
                  </div>
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
          <div className="mt-3 flex items-center justify-end gap-2 text-muted-foreground text-xs">
            <span>
              Page {page + 1} of {totalPages}
            </span>
            <button
              className="rounded border border-border bg-background px-2 py-1 disabled:opacity-40"
              disabled={page === 0}
              onClick={onPrev}
            >
              &lt;
            </button>
            <button
              className="rounded border border-border bg-background px-2 py-1 disabled:opacity-40"
              disabled={page >= totalPages - 1}
              onClick={onNext}
            >
              &gt;
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type DesktopTableProps = {
  transactions: HistoryListItem[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onTransactionClick: (tx: HistoryListItem) => void;
};

function DesktopTable({
  transactions,
  loading,
  page,
  totalPages,
  onPrev,
  onNext,
  onTransactionClick,
}: DesktopTableProps) {
  return (
    <Card className="hidden md:block">
      <CardHeader className="pb-2">
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="font-semibold text-foreground text-lg">
            Transaction
          </CardTitle>
          <button
            className="flex items-center gap-2"
            onClick={() => {
              window.location.href = "/dashboard/transactions";
            }}
          >
            <span className="text-muted-foreground text-sm">View All</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="mt-2 h-px w-full bg-border" />
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full gap-2 md:w-auto">
            <div className="relative w-full md:w-48">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
              <input
                className="w-full rounded border border-border bg-background py-1 pr-3 pl-9 text-sm"
                placeholder="Search"
                type="text"
              />
            </div>
            <button className="flex items-center gap-1 rounded border border-border bg-background px-3 py-1 text-sm">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
          <button className="ml-auto flex items-center gap-1 rounded border border-border bg-background px-3 py-1 text-sm">
            Export CSV <span className="ml-1">↗</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#0C0E10]">
                <TableHead className="text-foreground">Paid on</TableHead>
                <TableHead className="text-foreground">Method</TableHead>
                <TableHead className="text-foreground">
                  Crypto Currency
                </TableHead>
                <TableHead className="text-foreground">Wallet</TableHead>
                <TableHead className="text-foreground">Amount</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-muted-foreground"
                    colSpan={6}
                  >
                    Loading transactions...
                  </TableCell>
                </TableRow>
              )}
              {!loading && transactions.length === 0 && (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-muted-foreground"
                    colSpan={6}
                  >
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                transactions.map((tx) => (
                 <TableRow
                   key={tx.id}
                   className="cursor-pointer hover:bg-muted/5"
                   onClick={() => onTransactionClick(tx)}
                 >
                    <TableCell className="px-3 py-4 text-foreground">
                      {tx.paidOn}
                    </TableCell>
                    <TableCell className="px-3 py-4 text-foreground">
                      Crypto
                    </TableCell>
                    <TableCell className="px-3 py-4 text-foreground">
                      {tx.currencyDisplay}
                    </TableCell>
                    <TableCell className="px-3 py-4 text-foreground">
                      <div className="flex items-center gap-1">
                        <span className="block min-w-0 max-w-[140px] cursor-pointer truncate text-blue-300">
                          {tx.walletAddress}
                        </span>
                        <Copy className="h-3 w-3 flex-shrink-0 cursor-pointer" />
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-4 text-foreground">
                      {tx.amountDisplay}
                    </TableCell>
                    <TableCell className="px-3 py-4 text-foreground">
                      <span
                        className={`rounded px-2 py-1 font-medium text-xs ${tx.statusClass}`}
                      >
                        {tx.statusLabel}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex flex-col text-muted-foreground text-xs md:flex-row md:items-center md:justify-between">
          <span>Showing {transactions.length} entries</span>
          <div className="mt-2 flex items-center gap-2 md:mt-0">
            <span>Page</span>
            <span className="rounded border border-border bg-background px-2 py-1">
              {page + 1}
            </span>
            <span>of {totalPages}</span>
            <button
              className="rounded border border-border bg-background px-2 py-1 disabled:opacity-40"
              disabled={page === 0}
              onClick={onPrev}
            >
              &lt;
            </button>
            <button
              className="rounded border border-border bg-background px-2 py-1 disabled:opacity-40"
              disabled={page >= totalPages - 1}
              onClick={onNext}
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
  const [selectedDetails, setSelectedDetails] = React.useState<DetailsData | null>(null);

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
  const handleTransactionClick = (tx: HistoryListItem) => {
    setSelectedDetails(tx.details);
  };

  return (
    <div>
      <MobileList
        loading={loading}
        onNext={handleNext}
        onPrev={handlePrev}
        onTransactionClick={handleTransactionClick}
        page={page}
        totalPages={totalPages}
        transactions={pageItems}
      />
      <DesktopTable
        loading={loading}
        onNext={handleNext}
        onPrev={handlePrev}
        onTransactionClick={handleTransactionClick}
        page={page}
        totalPages={totalPages}
        transactions={pageItems}
      />
      <DetailsModal
        open={!!selectedDetails}
        onOpenChange={(open: boolean) => !open && setSelectedDetails(null)}
        data={selectedDetails}
      />
    </div>
  );
}
