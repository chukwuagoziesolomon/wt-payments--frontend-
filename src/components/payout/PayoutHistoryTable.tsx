"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { DetailsModal } from "../DetailsModal";
import { DetailsData } from "@/types";
import { authFetch } from "@/lib/auth-fetch";
import { useToast } from "@/components/ui/ToastProvider";

const API = "/backend";

type PayoutHistoryItem = {
  id: string;
  paid_on: string;
  method: "Crypto" | "Fiat";
  crypto_currency: string;
  wallet: string;
  amount: number;
  status: string;
};

type PayoutHistoryMeta = {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
};

type PayoutHistoryResponse = {
  success: boolean;
  data: {
    data: PayoutHistoryItem[];
    meta: PayoutHistoryMeta;
  };
  summary?: {
    total_payout: number;
    pending_payout: number;
    current_pending_interval: number;
  };
};

function getToken() {
  return typeof window !== "undefined" ? (localStorage.getItem("authToken") || localStorage.getItem("token") || "") : "";
}

export function PayoutHistoryTable() {
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<DetailsData | null>(null);
  const [filter, setFilter] = useState<"All" | "Crypto" | "Fiat">("All");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<PayoutHistoryItem[]>([]);
  const [meta, setMeta] = useState<PayoutHistoryMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: filter === "All" ? "all" : filter.toLowerCase(),
        page: String(page),
        limit: "20",
        ...(search ? { search } : {}),
      });

      const res = await authFetch(`${API}/user/payout/history?${params.toString()}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = (await res.json().catch(() => ({}))) as PayoutHistoryResponse;

      if (res.ok && json.success && json.data) {
        setItems(json.data.data);
        setMeta(json.data.meta);
      } else {
        notify((json as any).message || "Failed to load payout history");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") notify("Error loading payout history");
    } finally {
      setLoading(false);
    }
  }, [filter, page, search, notify]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const cryptoCount = items.filter((r) => r.method === "Crypto").length;
  const fiatCount = items.filter((r) => r.method === "Fiat").length;

  const handleRowClick = (row: PayoutHistoryItem) => {
    setSelectedData({
      type: "withdrawal",
      amountPaid: `$${row.amount.toLocaleString()}`,
      equivalent: row.crypto_currency,
      receiver: row.wallet,
      paidOn: row.paid_on,
      paymentMethod: row.method,
      id: row.id,
      token: row.crypto_currency,
      blockchain: row.method === "Crypto" ? "NATIVE" : "ASSET",
      networkFee: "",
      receiverAddress: row.wallet,
      senderAddress: row.wallet,
      qrCode: "",
      status: row.status.charAt(0).toUpperCase() + row.status.slice(1),
      activityLog: [],
    } as DetailsData);
    setOpen(true);
  };

  const currentPage = meta?.current_page ?? 1;
  const lastPage = meta?.last_page ?? 1;
  const totalItems = meta?.total ?? items.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-3">
          <CardTitle className="text-base font-semibold text-left">Payout History</CardTitle>

          <div className="text-sm text-muted-foreground mb-2">
            <div className="w-full flex items-center">
              <button onClick={() => setFilter("All")} className={`flex-1 text-left ${filter === "All" ? "text-foreground font-medium" : "text-muted-foreground"}`}>All ({totalItems})</button>
              <button onClick={() => setFilter("Crypto")} className={`flex-1 text-center ${filter === "Crypto" ? "text-foreground font-medium" : "text-muted-foreground"}`}>Crypto ({cryptoCount})</button>
              <button onClick={() => setFilter("Fiat")} className={`flex-1 text-right ${filter === "Fiat" ? "text-foreground font-medium" : "text-muted-foreground"}`}>Fiat ({fiatCount})</button>
            </div>
          </div>
        </div>

        <div className="border-t border-border" />

        <div className="hidden md:flex justify-between items-center gap-2">
          <div className="flex gap-2">
            <input
              className="bg-background border border-border rounded px-3 py-1 text-sm"
              placeholder="Search by wallet or currency"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            <button className="bg-background border border-border rounded px-3 py-1 text-sm flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
          <button className="bg-background border border-border rounded px-3 py-1 text-sm">Export CSV ↗</button>
        </div>

        <div className="md:hidden">
          <div className="flex items-center gap-3 py-3">
            <button aria-label="Search" className="h-10 w-10 flex items-center justify-center rounded-md border border-border bg-background">
              <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button aria-label="Filter" className="h-10 w-10 flex items-center justify-center rounded-md border border-border bg-background">
              <Filter className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="flex-1" />
            <button className="ml-2 bg-background border border-border rounded px-3 py-2 text-xs">Export CSV ↗</button>
          </div>
          <div className="border-t border-border mb-4" />
        </div>
      </div>

      <Card>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Loading payout history...</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">No payouts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#0C0E10]">
                  <TableRow>
                    <TableHead>Paid on</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Crypto Currency</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row) => (
                    <TableRow key={row.id} className="cursor-pointer hover:bg-gray-800" onClick={() => handleRowClick(row)}>
                      <TableCell className="py-4 px-3">{row.paid_on}</TableCell>
                      <TableCell className="py-4 px-3">{row.method}</TableCell>
                      <TableCell className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{row.crypto_currency[0]}</span>
                          </div>
                          <span>{row.crypto_currency}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-3">
                        <div className="flex items-center gap-1">
                          <span className="text-blue-300 cursor-pointer">{row.wallet}</span>
                          <Copy className="w-3 h-3" />
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-3">${row.amount.toLocaleString()}</TableCell>
                      <TableCell className="py-4 px-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${row.status === "completed" ? "bg-green-900 text-green-200" : row.status === "pending" ? "bg-yellow-900 text-yellow-200" : "bg-gray-700 text-gray-200"}`}>{row.status}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>Showing {items.length} entries</span>
            <div className="flex items-center gap-2">
              <span>Page</span>
              <span className="px-2 py-1 bg-background border border-border rounded">{currentPage}</span>
              <span>of {lastPage}</span>
              <button
                className="px-2 py-1 bg-background border border-border rounded disabled:opacity-50"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                &lt;
              </button>
              <button
                className="px-2 py-1 bg-background border border-border rounded disabled:opacity-50"
                disabled={currentPage >= lastPage}
                onClick={() => setPage((p) => p + 1)}
              >
                &gt;
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
      <DetailsModal open={open} onOpenChange={setOpen} data={selectedData} />
    </div>
  );
}
