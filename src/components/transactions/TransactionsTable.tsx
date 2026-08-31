"use client";

import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionLoader } from "@/components/ui/LoadingAnimator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getPaymentIntentHistory,
  type HistoryListItem,
} from "@/lib/payment-intent-history";
import type { DetailsData } from "@/types";
import { DetailsModal } from "../DetailsModal";

export function TransactionsTable() {
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<DetailsData | null>(null);
  const [rows, setRows] = useState<HistoryListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadHistory() {
      setLoading(true);
      try {
        const { items } = await getPaymentIntentHistory();
        if (mounted) setRows(items);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadHistory();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRowClick = (row: HistoryListItem) => {
    setSelectedData(row.details);
    setOpen(true);
  };

  return (
    <div className="relative">
      {/* Header section outside the card */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center gap-2 md:w-auto">
          <input
            className="w-full rounded border border-border bg-background px-3 py-1 text-sm md:w-56"
            placeholder="Search"
            type="text"
          />
          <button className="rounded border border-border bg-background px-3 py-1 text-sm">
            Filter
          </button>
        </div>
        <div className="flex w-full items-center justify-end md:w-auto">
          <button
            className="hidden rounded bg-primary px-3 py-1 text-primary-foreground text-sm md:inline-flex"
            onClick={() => (window.location.href = "/transactions/create")}
          >
            Create Transaction
          </button>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#0C0E10]">
                <TableRow>
                  <TableHead>Paid on</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Crypto Currency</TableHead>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
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
                {!loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      className="py-8 text-center text-muted-foreground"
                      colSpan={6}
                    >
                      No additional transactions to display.
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  rows.map((row) => (
                    <TableRow
                      className="cursor-pointer hover:bg-gray-800"
                      key={row.id}
                      onClick={() => handleRowClick(row)}
                    >
                      <TableCell className="px-3 py-4">{row.paidOn}</TableCell>
                      <TableCell className="px-3 py-4">
                        {row.customer}
                      </TableCell>
                      <TableCell className="px-3 py-4">
                        {row.currencyDisplay}
                      </TableCell>
                      <TableCell className="px-3 py-4">
                        <div className="flex items-center gap-1">
                          <span className="block min-w-0 max-w-[140px] cursor-pointer truncate text-blue-300">
                            {row.walletAddress}
                          </span>
                          <Copy className="h-3 w-3 flex-shrink-0" />
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-4">
                        {row.amountDisplay}
                        {row.txHash && (
                          <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[140px]">
                            TX: {row.txHash}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-4">
                        <span
                          className={`rounded px-2 py-1 font-medium text-xs ${row.statusClass}`}
                        >
                          {row.statusLabel}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex flex-col text-muted-foreground text-xs md:flex-row md:items-center md:justify-between">
            <span>Showing {rows.length} entries</span>
            <div className="mt-2 flex items-center gap-2 md:mt-0">
              <span>Page</span>
              <span className="rounded border border-border bg-background px-2 py-1">
                1
              </span>
              <span>of 0</span>
              <button className="rounded border border-border bg-background px-2 py-1">
                &lt;
              </button>
              <button className="rounded border border-border bg-background px-2 py-1">
                &gt;
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Mobile bottom action */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-border border-t bg-background/90 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 md:hidden">
        <button
          className="h-12 w-full rounded-md bg-primary font-medium text-base text-primary-foreground"
          onClick={() => (window.location.href = "/transactions/create")}
        >
          Create Transaction
        </button>
      </div>
      <DetailsModal data={selectedData} onOpenChange={setOpen} open={open} />
    </div>
  );
}
