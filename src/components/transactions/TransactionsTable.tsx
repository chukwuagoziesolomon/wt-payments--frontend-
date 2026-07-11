"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy } from "lucide-react";
import { DetailsModal } from "../DetailsModal";
import { DetailsData } from "@/types";
import { getPaymentIntentHistory, type HistoryListItem } from "@/lib/payment-intent-history";
import { SectionLoader } from "@/components/ui/LoadingAnimator";

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
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search"
            className="bg-background border border-border rounded px-3 py-1 text-sm w-full md:w-56"
          />
          <button className="bg-background border border-border rounded px-3 py-1 text-sm">Filter</button>
        </div>
        <div className="flex items-center justify-end w-full md:w-auto">
          <button onClick={() => window.location.href = '/transactions/create'} className="hidden md:inline-flex bg-primary text-primary-foreground rounded px-3 py-1 text-sm">Create Transaction</button>
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
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Loading transactions...
                    </TableCell>
                  </TableRow>
                )}
                {!loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No additional transactions to display.
                    </TableCell>
                  </TableRow>
                )}
                {!loading && rows.map((row) => (
                  <TableRow key={row.id} className="cursor-pointer hover:bg-gray-800" onClick={() => handleRowClick(row)}>
                    <TableCell className="py-4 px-3">{row.paidOn}</TableCell>
                    <TableCell className="py-4 px-3">{row.customer}</TableCell>
                    <TableCell className="py-4 px-3">{row.currencyDisplay}</TableCell>
                    <TableCell className="py-4 px-3">
                      <div className="flex items-center gap-1">
                        <span className="text-blue-300 cursor-pointer">{row.walletAddress}</span>
                        <Copy className="w-3 h-3" />
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-3">{row.amountDisplay}</TableCell>
                    <TableCell className="py-4 px-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${row.statusClass}`}>{row.statusLabel}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 text-xs text-muted-foreground">
            <span>Showing {rows.length} entries</span>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <span>Page</span>
              <span className="px-2 py-1 bg-background border border-border rounded">1</span>
              <span>of 0</span>
              <button className="px-2 py-1 bg-background border border-border rounded">&lt;</button>
              <button className="px-2 py-1 bg-background border border-border rounded">&gt;</button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Mobile bottom action */}
      <div className="fixed inset-x-0 bottom-0 z-30 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t border-border p-4 md:hidden">
        <button onClick={() => window.location.href = '/transactions/create'} className="w-full h-12 rounded-md bg-primary text-primary-foreground text-base font-medium">Create Transaction</button>
      </div>
      <DetailsModal open={open} onOpenChange={setOpen} data={selectedData} />
    </div>
  );
}
