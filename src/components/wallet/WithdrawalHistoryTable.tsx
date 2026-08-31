"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Filter, Search } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import { DetailsModal } from "../DetailsModal";
import { DetailsData } from "@/types";
import type { WithdrawalHistoryItem } from "@/types";

function getCryptoIcon(symbol?: string) {
  const s = (symbol || "").toUpperCase();
  if (s === "USDC") return <img src="/images/usdcbase.png" alt="USDC" className="w-6 h-6 rounded-full" />;
  if (s === "USDT") return <img src="/images/usdtasset.png" alt="USDT" className="w-6 h-6 rounded-full" />;
  if (s === "SOL") return <span className="inline-flex w-6 h-6 bg-[#9945ff] rounded-full items-center justify-center text-white text-[9px] font-bold">SOL</span>;
  if (s === "TRX" || s === "TRON") return <span className="inline-flex w-6 h-6 bg-[#ff060a] rounded-full items-center justify-center text-white text-[9px] font-bold">TRX</span>;
  if (s === "CKB") return <span className="inline-flex w-6 h-6 bg-[#3dba9e] rounded-full items-center justify-center text-white text-[10px] font-bold">CKB</span>;
  if (s === "ETH") return <span className="inline-flex w-6 h-6 bg-[#627eea] rounded-full items-center justify-center text-white text-[10px] font-bold">ETH</span>;
  if (s === "MATIC" || s === "POL") return <span className="inline-flex w-6 h-6 bg-[#8247e5] rounded-full items-center justify-center text-white text-[9px] font-bold">POL</span>;
  return <img src="/images/usdtasset.png" alt={s} className="w-6 h-6 rounded-full" />;
}

const statusClass = {
  Pending: "bg-yellow-900 text-yellow-200",
  Completed: "bg-green-900 text-green-200",
  Processing: "bg-blue-900 text-blue-200",
  Failed: "bg-red-900 text-red-200",
  Cancelled: "bg-gray-800 text-gray-200",
} as const;

function DesktopTable({ rows }: { rows: WithdrawalHistoryItem[] }) {
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<DetailsData | null>(null);
  const [filter, setFilter] = useState<'All' | 'Crypto' | 'Fiat'>('All');

  const cryptoCount = rows.filter((r) => r.method?.toLowerCase() === 'crypto').length;
  const fiatCount = rows.filter((r) => r.method?.toLowerCase() === 'fiat').length;
  const filteredRows = filter === 'All' ? rows : rows.filter((r) => filter === 'Crypto' ? r.method?.toLowerCase() === 'crypto' : r.method?.toLowerCase() === 'fiat');

  const handleRowClick = (row: DetailsData) => {
    setSelectedData(row);
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        {/* Title and Tabs Row */}
        <div className="flex flex-col space-y-3">
          <CardTitle className="text-base font-semibold text-left">Withdrawal History</CardTitle>

          {/* Tab Filters */}
          <div className="flex items-center gap-6">
            <button onClick={() => setFilter('All')} className={`text-sm font-medium ${filter === 'All' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'} pb-1`}>All ({rows.length})</button>
            <button onClick={() => setFilter('Crypto')} className={`text-sm ${filter === 'Crypto' ? 'text-primary border-b-2 border-primary font-medium' : 'text-muted-foreground hover:text-foreground'} pb-1`}>Crypto ({cryptoCount})</button>
            <button onClick={() => setFilter('Fiat')} className={`text-sm ${filter === 'Fiat' ? 'text-primary border-b-2 border-primary font-medium' : 'text-muted-foreground hover:text-foreground'} pb-1`}>Fiat ({fiatCount})</button>
          </div>
        </div>

        {/* Horizontal Line */}
        <div className="border-t border-border"></div>

        {/* Controls Row */}
        <div className="flex justify-between items-center gap-2">
          <div className="flex gap-2">
            <input className="bg-background border border-border rounded px-3 py-1 text-sm" placeholder="Search" />
            <button className="bg-background border border-border rounded px-3 py-1 text-sm flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
          <button className="bg-background border border-border rounded px-3 py-1 text-sm">Export CSV ↗</button>
        </div>
      </div>

      <Card>
        <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
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
              {filteredRows.map((row) => (
                <TableRow key={row.id} className="cursor-pointer hover:bg-gray-800" onClick={() => handleRowClick({
                  type: 'withdrawal',
                  amountPaid: `${row.amount} ${row.crypto_currency || 'USDT'}`,
                  equivalent: '-',
                  receiver: row.method === 'Fiat' ? 'Bank Account' : 'Crypto Wallet',
                  paidOn: row.paidOn,
                  paymentMethod: row.method,
                  id: row.id,
                  token: row.crypto_currency || 'USDT',
                  blockchain: row.network || 'N/A',
                  networkFee: 'N/A',
                  receiverAddress: row.wallet || '-',
                  senderAddress: '-',
                  qrCode: '',
                  status: row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'Pending',
                  activityLog: [],
                } as DetailsData)}>
                  <TableCell className="py-4 px-3">{row.paidOn}</TableCell>
                  <TableCell className="py-4 px-3">{row.method}</TableCell>
                  <TableCell className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      {getCryptoIcon(row.crypto_currency)}
                      <span>{row.crypto_currency || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-3">
                    <div className="flex items-center gap-1">
                      <span className="text-blue-300 cursor-pointer">{row.wallet || '-'}</span>
                      <Copy className="w-3 h-3" />
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-3">{row.amount ? `${row.amount} ${row.crypto_currency || 'USDT'}` : '-'}</TableCell>
                  <TableCell className="py-4 px-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusClass[(row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'Pending') as keyof typeof statusClass] || 'bg-gray-800 text-gray-200'}`}>{row.status || 'Pending'}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span>Showing {filteredRows.length} entries</span>
          <div className="flex items-center gap-2">
            <span>Page</span>
            <span className="px-2 py-1 bg-background border border-border rounded">1</span>
            <span>of 0</span>
            <button className="px-2 py-1 bg-background border border-border rounded">&lt;</button>
            <button className="px-2 py-1 bg-background border border-border rounded">&gt;</button>
          </div>
        </div>
        </CardContent>
      </Card>
      <DetailsModal open={open} onOpenChange={setOpen} data={selectedData} />
    </div>
  );
}

function MobileList({ rows }: { rows: WithdrawalHistoryItem[] }) {
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<DetailsData | null>(null);
  const [filter, setFilter] = useState<'All' | 'Crypto' | 'Fiat'>('All');
  const router = useRouter();

  const cryptoCount = rows.filter((r) => r.method?.toLowerCase() === 'crypto').length;
  const fiatCount = rows.filter((r) => r.method?.toLowerCase() === 'fiat').length;
  const filteredRows = filter === 'All' ? rows : rows.filter((r) => filter === 'Crypto' ? r.method?.toLowerCase() === 'crypto' : r.method?.toLowerCase() === 'fiat');

  const handleRowClick = (row: DetailsData) => {
    setSelectedData(row);
    setOpen(true);
  };

  const months = [
    {
      month: "Recent",
      inTotal: "-",
      outTotal: "-",
      items: filteredRows,
    },
  ];

  return (
    <div className="md:hidden relative pb-24">
      {/* Tabs */}
      <div className="text-xs text-muted-foreground mb-2">
        <div className="w-full flex items-center">
          <button onClick={() => setFilter('All')} className={`flex-1 text-left ${filter === 'All' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>All ({rows.length})</button>
          <button onClick={() => setFilter('Crypto')} className={`flex-1 text-center ${filter === 'Crypto' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>Crypto ({cryptoCount})</button>
          <button onClick={() => setFilter('Fiat')} className={`flex-1 text-right ${filter === 'Fiat' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>Fiat ({fiatCount})</button>
        </div>
      </div>
      {/* Mobile: only show search + filter icons, then a divider */}
      <div className="flex items-center gap-3 mb-3 border-t border-border pt-3 pb-3">
        <button aria-label="Search" className="h-10 w-10 flex items-center justify-center rounded-md border border-border bg-background">
          <Search className="h-4 w-4 text-muted-foreground" />
        </button>
        <button aria-label="Filter" className="h-10 w-10 flex items-center justify-center rounded-md border border-border bg-background">
          <Filter className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex-1" />
      </div>

      <div className="border-t border-border mb-4" />

      {months.map((m) => (
        <Card key={m.month} className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">{m.month}</CardTitle>
            <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
              <span>In: {m.inTotal}</span>
              <span>Out: {m.outTotal}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="flex flex-col">
              {m.items.map((tx, idx) => (
                <li key={tx.id} className={`flex items-start justify-between py-4 px-3 ${idx !== m.items.length - 1 ? 'border-b border-border' : ''} cursor-pointer hover:bg-gray-800`} onClick={() => handleRowClick({
                  type: 'withdrawal',
                  amountPaid: `${tx.amount} ${tx.crypto_currency || 'USDT'}`,
                  equivalent: '-',
                  receiver: tx.method === 'Fiat' ? 'Bank Account' : 'Crypto Wallet',
                  paidOn: tx.paidOn,
                  paymentMethod: tx.method,
                  id: tx.id,
                  token: tx.crypto_currency || 'USDT',
                  blockchain: tx.network || 'N/A',
                  networkFee: 'N/A',
                  receiverAddress: tx.wallet || '-',
                  senderAddress: '-',
                  qrCode: '',
                  status: tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1) : 'Pending',
                  activityLog: [],
                } as DetailsData)}>
                  <div className="flex-1 pr-3">
                    <div className="text-base font-medium">{tx.method}</div>
                    <div className="mt-1 flex items-center gap-1 text-[13px] text-blue-300">
                      <span>{tx.wallet || '-'}</span>
                      <Copy className="h-3.5 w-3.5" />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{tx.paidOn}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-semibold">{tx.amount ? `${tx.amount} ${tx.crypto_currency || 'USDT'}` : '-'}</div>
                    <div className="mt-2">
                      <Badge className={`${statusClass[(tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1) : 'Pending') as keyof typeof statusClass] || 'bg-gray-800 text-gray-200'} px-2 py-0.5 text-xs`}>
                        {tx.status || 'Pending'}
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
      <div className="fixed inset-x-0 bottom-0 z-30 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t border-border p-4">
        <button
          className="w-full h-12 rounded-md bg-primary text-primary-foreground text-base font-medium"
          onClick={() => {
            const router = useRouter();
            router.push('/dashboard/wallet/withdraw');
          }}
        >
          Withdraw
        </button>
      </div>
      <DetailsModal open={open} onOpenChange={setOpen} data={selectedData} />
    </div>
  );
}

export function WithdrawalHistoryTable() {
  const [rows, setRows] = useState<WithdrawalHistoryItem[]>([]);
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
        const res = await authFetch(`${apiBase}/user/withdrawals/history?page=1&limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Failed to load withdrawal history");
        if (active) setRows(json?.data?.data || []);
      } catch (err: any) {
        if (active) setError(err.message || "Failed to load withdrawal history");
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
    <div>
      {loading && <div className="text-sm text-muted-foreground mb-3">Loading withdrawal history…</div>}
      {error && <div className="text-sm text-destructive mb-3">{error}</div>}
      <div className="hidden md:block">
        <DesktopTable rows={rows} />
      </div>
      <MobileList rows={rows} />
    </div>
  );
}
