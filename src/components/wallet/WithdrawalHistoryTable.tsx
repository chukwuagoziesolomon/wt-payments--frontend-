"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Filter, Search } from "lucide-react";
import { DetailsModal } from "../DetailsModal";
import { DetailsData } from "@/types";

interface HistoryItem {
  id: number | string;
  uniqueId?: string;
  recipientType?: string;
  recipientName?: string;
  recipientAccountNumber?: string;
  usdtAmount?: number;
  nairaAmount?: number;
  fee?: number;
  status?: string;
  initiatedAt?: string;
  processedAt?: string | null;
  completedAt?: string | null;
}

const statusClass = {
  Pending: "bg-yellow-900 text-yellow-200",
  Completed: "bg-green-900 text-green-200",
  Processing: "bg-blue-900 text-blue-200",
  Failed: "bg-red-900 text-red-200",
  Cancelled: "bg-gray-800 text-gray-200",
} as const;

function DesktopTable({ rows }: { rows: HistoryItem[] }) {
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<DetailsData | null>(null);
  const [filter, setFilter] = useState<'All' | 'Crypto' | 'Fiat'>('All');

  const cryptoCount = rows.filter((r) => !(r.recipientType || '').toLowerCase().includes('bank')).length;
  const fiatCount = rows.filter((r) => (r.recipientType || '').toLowerCase().includes('bank')).length;
  const filteredRows = filter === 'All' ? rows : rows.filter((r) => filter === 'Crypto' ? !(r.recipientType || '').toLowerCase().includes('bank') : (r.recipientType || '').toLowerCase().includes('bank'));

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
                  amountPaid: `${row.usdtAmount ?? 0} USDT`,
                  equivalent: `${row.nairaAmount ?? 0} NGN`,
                  receiver: row.recipientName || 'Recipient',
                  paidOn: row.initiatedAt ? new Date(row.initiatedAt).toLocaleDateString() : '-',
                  paymentMethod: row.recipientType || 'Withdrawal',
                  id: String(row.id),
                  token: 'USDT',
                  blockchain: 'BASE',
                  networkFee: `${row.fee ?? 0} USDT`,
                  receiverAddress: row.recipientAccountNumber || row.recipientName || '-',
                  senderAddress: '-',
                  qrCode: '',
                  status: row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'Pending',
                  activityLog: [],
                } as DetailsData)}>
                  <TableCell className="py-4 px-3">{row.initiatedAt ? new Date(row.initiatedAt).toLocaleDateString() : '-'}</TableCell>
                  <TableCell className="py-4 px-3">{row.recipientType || 'Withdrawal'}</TableCell>
                  <TableCell className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <img src="/images/usdtasset.png" alt="USDT" className="w-6 h-6 rounded-full" />
                      <span>USDT</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-3">
                    <div className="flex items-center gap-1">
                      <span className="text-blue-300 cursor-pointer">{row.recipientAccountNumber || row.recipientName || '-'}</span>
                      <Copy className="w-3 h-3" />
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-3">{row.usdtAmount ? `${row.usdtAmount} USDT` : '-'}</TableCell>
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

function MobileList({ rows }: { rows: HistoryItem[] }) {
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<DetailsData | null>(null);
  const [filter, setFilter] = useState<'All' | 'Crypto' | 'Fiat'>('All');
  const router = useRouter();

  const cryptoCount = rows.filter((r) => !(r.recipientType || '').toLowerCase().includes('bank')).length;
  const fiatCount = rows.filter((r) => (r.recipientType || '').toLowerCase().includes('bank')).length;
  const filteredRows = filter === 'All' ? rows : rows.filter((r) => filter === 'Crypto' ? !(r.recipientType || '').toLowerCase().includes('bank') : (r.recipientType || '').toLowerCase().includes('bank'));

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
                  amountPaid: `${tx.usdtAmount ?? 0} USDT`,
                  equivalent: `${tx.nairaAmount ?? 0} NGN`,
                  receiver: tx.recipientName || 'Recipient',
                  paidOn: tx.initiatedAt ? new Date(tx.initiatedAt).toLocaleDateString() : '-',
                  paymentMethod: tx.recipientType || 'Withdrawal',
                  id: String(tx.id),
                  token: 'USDT',
                  blockchain: 'BASE',
                  networkFee: `${tx.fee ?? 0} USDT`,
                  receiverAddress: tx.recipientAccountNumber || tx.recipientName || '-',
                  senderAddress: '-',
                  qrCode: '',
                  status: tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1) : 'Pending',
                  activityLog: [],
                } as DetailsData)}>
                  <div className="flex-1 pr-3">
                    <div className="text-base font-medium">{tx.recipientType || 'Withdrawal'}</div>
                    <div className="mt-1 flex items-center gap-1 text-[13px] text-blue-300">
                      <span>{tx.recipientAccountNumber || tx.recipientName || '-'}</span>
                      <Copy className="h-3.5 w-3.5" />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{tx.initiatedAt ? new Date(tx.initiatedAt).toLocaleDateString() : '-'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-semibold">{tx.usdtAmount ? `${tx.usdtAmount} USDT` : '-'}</div>
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
  const [rows, setRows] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";
        const token = localStorage.getItem("authToken") || localStorage.getItem("token") || "";
        const res = await fetch(`${apiBase}/user/withdrawals/history?page=1&limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
          credentials: "include",
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
