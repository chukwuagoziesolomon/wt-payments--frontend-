"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Filter, Search } from "lucide-react";
import { DetailsModal } from "../DetailsModal";
import { DetailsData } from "@/types";

const rows: DetailsData[] = [
  {
    type: "withdrawal",
    amountPaid: "200$",
    equivalent: "≈ 199.99 USDC",
    receiver: "Eze Emmanuella",
    paidOn: "04 Sept. 2025",
    paymentMethod: "Crypto",
    id: "0x23bhs99992ss3e2wsq",
    token: "USDC",
    blockchain: "BASE",
    networkFee: "1.99 USDC ($2)",
    receiverAddress: "usdt..e723648475",
    senderAddress: "usdt..e723648475",
    qrCode: "https://example.com/qr",
    status: "Pending",
    activityLog: [
      { icon: "shield", title: "AML Screening", description: "Tool: OFAC protocol", status: "Cleared", date: "21 July, 2025", time: "2:59 AM UTC" },
      { icon: "zap", title: "Network Fee", description: "A fee of 1.99 USDC ($2) was successfully deducted to process the withdrawal" },
    ],
  },
  {
    type: "withdrawal",
    amountPaid: "200$",
    equivalent: "≈ 199.99 USDT",
    receiver: "Ebube Kelvin",
    paidOn: "04 Sept. 2025",
    paymentMethod: "Fiat",
    id: "0x23bhs99992ss3e2wsq",
    token: "USDT",
    blockchain: "ASSET",
    networkFee: "1.99 USDC ($2)",
    receiverAddress: "usdt..e723648475",
    senderAddress: "usdt..e723648475",
    qrCode: "https://example.com/qr",
    status: "Completed",
    activityLog: [
      { icon: "shield", title: "AML Screening", description: "Tool: OFAC protocol", status: "Cleared", date: "21 July, 2025", time: "2:59 AM UTC" },
      { icon: "zap", title: "Network Fee", description: "A fee of 1.99 USDC ($2) was successfully deducted to process the withdrawal" },
    ],
  },
  {
    type: "withdrawal",
    amountPaid: "200$",
    equivalent: "≈ 199.99 USDC",
    receiver: "John Doe",
    paidOn: "04 Sept. 2025",
    paymentMethod: "Crypto",
    id: "0x23bhs99992ss3e2wsq",
    token: "USDC",
    blockchain: "BASE",
    networkFee: "1.99 USDC ($2)",
    receiverAddress: "72364847565",
    senderAddress: "72364847565",
    qrCode: "https://example.com/qr",
    status: "Completed",
    activityLog: [
      { icon: "shield", title: "AML Screening", description: "Tool: OFAC protocol", status: "Cleared", date: "21 July, 2025", time: "2:59 AM UTC" },
      { icon: "zap", title: "Network Fee", description: "A fee of 1.99 USDC ($2) was successfully deducted to process the withdrawal" },
    ],
  },
  {
    type: "withdrawal",
    amountPaid: "200$",
    equivalent: "≈ 199.99 USDT",
    receiver: "Jane Smith",
    paidOn: "04 Sept. 2025",
    paymentMethod: "Fiat",
    id: "0x23bhs99992ss3e2wsq",
    token: "USDT",
    blockchain: "ASSET",
    networkFee: "1.99 USDC ($2)",
    receiverAddress: "72364847565",
    senderAddress: "72364847565",
    qrCode: "https://example.com/qr",
    status: "Completed",
    activityLog: [
      { icon: "shield", title: "AML Screening", description: "Tool: OFAC protocol", status: "Cleared", date: "21 July, 2025", time: "2:59 AM UTC" },
      { icon: "zap", title: "Network Fee", description: "A fee of 1.99 USDC ($2) was successfully deducted to process the withdrawal" },
    ],
  },
  {
    type: "withdrawal",
    amountPaid: "200$",
    equivalent: "≈ 199.99 USDC",
    receiver: "Mike Johnson",
    paidOn: "04 Sept. 2025",
    paymentMethod: "Crypto",
    id: "0x23bhs99992ss3e2wsq",
    token: "USDC",
    blockchain: "BASE",
    networkFee: "1.99 USDC ($2)",
    receiverAddress: "usdt..e723648475",
    senderAddress: "usdt..e723648475",
    qrCode: "https://example.com/qr",
    status: "Completed",
    activityLog: [
      { icon: "shield", title: "AML Screening", description: "Tool: OFAC protocol", status: "Cleared", date: "21 July, 2025", time: "2:59 AM UTC" },
      { icon: "zap", title: "Network Fee", description: "A fee of 1.99 USDC ($2) was successfully deducted to process the withdrawal" },
    ],
  },
];

const statusClass = {
  Pending: "bg-yellow-900 text-yellow-200",
  Completed: "bg-green-900 text-green-200",
} as const;

function DesktopTable() {
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<DetailsData | null>(null);
  const [filter, setFilter] = useState<'All' | 'Crypto' | 'Fiat'>('All');

  const cryptoCount = rows.filter(r => r.paymentMethod === 'Crypto').length;
  const fiatCount = rows.filter(r => r.paymentMethod === 'Fiat').length;
  const filteredRows = filter === 'All' ? rows : rows.filter(r => r.paymentMethod === filter);

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
              {filteredRows.map((row, i) => (
                <TableRow key={i} className="cursor-pointer hover:bg-gray-800" onClick={() => handleRowClick(row)}>
                  <TableCell className="py-4 px-3">{row.paidOn}</TableCell>
                  <TableCell className="py-4 px-3">{row.paymentMethod}</TableCell>
                  <TableCell className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      {row.token === 'USDT' && (
                        <img src="/images/usdtasset.png" alt="USDT" className="w-6 h-6 rounded-full" />
                      )}
                      {row.token === 'USDC' && (
                        <img src="/images/usdcbase.png" alt="USDC" className="w-6 h-6 rounded-full" />
                      )}
                      <span>{row.token}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-3">
                    <div className="flex items-center gap-1">
                      <span className="text-blue-300 cursor-pointer">{row.receiverAddress}</span>
                      <Copy className="w-3 h-3" />
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-3">{row.amountPaid}</TableCell>
                  <TableCell className="py-4 px-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusClass[row.status as keyof typeof statusClass]}`}>{row.status}</span>
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

function MobileList() {
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<DetailsData | null>(null);
  const [filter, setFilter] = useState<'All' | 'Crypto' | 'Fiat'>('All');
  const router = useRouter();

  const cryptoCount = rows.filter(r => r.paymentMethod === 'Crypto').length;
  const fiatCount = rows.filter(r => r.paymentMethod === 'Fiat').length;
  const filteredRows = filter === 'All' ? rows : rows.filter(r => r.paymentMethod === filter);

  const handleRowClick = (row: DetailsData) => {
    setSelectedData(row);
    setOpen(true);
  };

  const months = [
    {
      month: "Sept 2025",
      inTotal: "$100",
      outTotal: "$200",
      items: filteredRows,
    },
    {
      month: "Aug 2025",
      inTotal: "$100",
      outTotal: "$200",
      items: filteredRows.slice(0, 1),
    },
  ];

  return (
    <div className="md:hidden relative pb-24">
      {/* Tabs */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <div className="flex items-center gap-4">
          <button onClick={() => setFilter('All')} className={`font-medium ${filter === 'All' ? 'text-foreground' : 'text-muted-foreground'}`}>All ({rows.length})</button>
          <button onClick={() => setFilter('Crypto')} className={`${filter === 'Crypto' ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>Crypto ({cryptoCount})</button>
          <button onClick={() => setFilter('Fiat')} className={`${filter === 'Fiat' ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>Fiat ({fiatCount})</button>
        </div>
      </div>
      {/* Search + Filter + Export */}
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
        <button className="ml-auto bg-background border border-border rounded px-3 py-2 text-xs">Export CSV ↗</button>
      </div>

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
                <li key={idx} className={`flex items-start justify-between py-4 px-3 ${idx !== m.items.length - 1 ? 'border-b border-border' : ''} cursor-pointer hover:bg-gray-800`} onClick={() => handleRowClick(tx)}>
                  <div className="flex-1 pr-3">
                    <div className="text-base font-medium">{tx.paymentMethod}</div>
                    <div className="mt-1 flex items-center gap-1 text-[13px] text-blue-300">
                      <span>{tx.receiverAddress}</span>
                      <Copy className="h-3.5 w-3.5" />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{tx.paidOn}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-semibold">{tx.amountPaid}</div>
                    <div className="mt-2">
                      <Badge className={`${statusClass[tx.status as keyof typeof statusClass]} px-2 py-0.5 text-xs`}>
                        {tx.status}
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
  return (
    <div>
      <div className="hidden md:block">
        <DesktopTable />
      </div>
      <MobileList />
    </div>
  );
}
