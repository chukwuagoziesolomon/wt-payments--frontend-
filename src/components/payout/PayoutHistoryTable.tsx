"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Filter } from "lucide-react";
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
      { icon: "zap", title: "Network Fee", description: "A fee of 1.99 USDC ($2) was successfully deducted to process the deposit" },
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
      { icon: "zap", title: "Network Fee", description: "A fee of 1.99 USDC ($2) was successfully deducted to process the deposit" },
    ],
  },
  // Add more rows similarly
];

const statusClass = {
  Pending: "bg-yellow-900 text-yellow-200",
  Completed: "bg-green-900 text-green-200",
} as const;

export function PayoutHistoryTable() {
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
          <CardTitle className="text-base font-semibold text-left">Payout History</CardTitle>

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
            <TableHeader className="bg-[#0C0E10]
">
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
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{row.token[0]}</span>
                      </div>
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

