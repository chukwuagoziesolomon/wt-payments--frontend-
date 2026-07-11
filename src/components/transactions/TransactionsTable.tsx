"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy } from "lucide-react";
import { DetailsModal } from "../DetailsModal";
import { DetailsData } from "@/types";
import Image from "next/image";

const rows: DetailsData[] = [
  {
    type: "transaction",
    amountPaid: "200$",
    equivalent: "≈ 199.99 USDT",
    receiver: "Eze Emmanuella",
    paidOn: "May 31, 2020, 3:00 AM UTC",
    paymentMethod: "Crypto",
    id: "0x23bhs99992ss3e2wsq",
    token: "USDT",
    blockchain: "Asset",
    networkFee: "1.99 USDC ($2)",
    receiverAddress: "usdt..e72364847",
    senderAddress: "usdt..e72364847",
    qrCode: "https://example.com/qr", // Placeholder
    status: "Completed",
    activityLog: [
      { icon: "shield", title: "AML Screening", description: "Tool: OFAC protocol", status: "Cleared", date: "21 July, 2025", time: "2:59 AM UTC" },
      { icon: "zap", title: "Network Fee", description: "A fee of 1.99 USDC ($2) was successfully deducted to process the deposit" },
      { icon: "download", title: "Deposit received", description: "Deposit of 1.0 USDT was successfully received.", time: "21 July, 2025" },
    ],
    deviceType: "Desktop",
    attempts: 0,
    error: "Second",
  },
  {
    type: "transaction",
    amountPaid: "200$",
    equivalent: "≈ 199.99 USDT",
    receiver: "Ebube Kelvin",
    paidOn: "May 31, 2020, 3:00 AM UTC",
    paymentMethod: "Crypto",
    id: "0x23bhs99992ss3e2wsq",
    token: "USDT",
    blockchain: "Asset",
    networkFee: "1.99 USDC ($2)",
    receiverAddress: "usdt..e72364847",
    senderAddress: "usdt..e72364847",
    qrCode: "https://example.com/qr",
    status: "Completed",
    activityLog: [
      { icon: "shield", title: "AML Screening", description: "Tool: OFAC protocol", status: "Cleared", date: "21 July, 2025", time: "2:59 AM UTC" },
      { icon: "zap", title: "Network Fee", description: "A fee of 1.99 USDC ($2) was successfully deducted to process the deposit" },
      { icon: "download", title: "Deposit received", description: "Deposit of 1.0 USDT was successfully received.", time: "21 July, 2025" },
    ],
  },
  // Add more rows similarly
];

const statusClass = {
  Pending: "bg-yellow-900 text-yellow-200",
  Completed: "bg-green-900 text-green-200",
} as const;

export function TransactionsTable() {
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<DetailsData | null>(null);

  const handleRowClick = (row: DetailsData) => {
    setSelectedData(row);
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
                {rows.map((row, i) => (
                  <TableRow key={i} className="cursor-pointer hover:bg-gray-800" onClick={() => handleRowClick(row)}>
                      <TableCell className="py-4 px-3">{row.paidOn}</TableCell>
                      <TableCell className="py-4 px-3">{row.receiver}</TableCell>
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
