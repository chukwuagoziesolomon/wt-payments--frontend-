"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Filter, Search } from "lucide-react";
import { DetailsSheet } from "../DetailsSheet";
import { DetailsData } from "@/types";

const months: Array<{
  month: string;
  inTotal: string;
  outTotal: string;
  items: DetailsData[];
}> = [
  {
    month: "Sept 2025",
    inTotal: "$100",
    outTotal: "$200",
    items: [
      {
        type: "transaction",
        amountPaid: "200 USDC",
        equivalent: "≈ 199.99 USDT",
        receiver: "Eze Emmanuella",
        paidOn: "4th Sept, 18:09pm",
        paymentMethod: "Crypto",
        id: "0x23bhs99992ss3e2wsq",
        token: "USDC",
        blockchain: "BASE",
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
      {
        type: "transaction",
        amountPaid: "200 USDC",
        equivalent: "≈ 199.99 USDT",
        receiver: "Eze Emmanuella",
        paidOn: "4th Sept, 18:09pm",
        paymentMethod: "Crypto",
        id: "0x23bhs99992ss3e2wsq",
        token: "USDC",
        blockchain: "BASE",
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
      {
        type: "transaction",
        amountPaid: "200 USDC",
        equivalent: "≈ 199.99 USDT",
        receiver: "Eze Emmanuella",
        paidOn: "4th Sept, 18:09pm",
        paymentMethod: "Crypto",
        id: "0x23bhs99992ss3e2wsq",
        token: "USDC",
        blockchain: "BASE",
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
    ],
  },
  {
    month: "Aug 2025",
    inTotal: "$100",
    outTotal: "$200",
    items: [
      {
        type: "transaction",
        amountPaid: "200 USDC",
        equivalent: "≈ 199.99 USDT",
        receiver: "Eze Emmanuella",
        paidOn: "4th Sept, 18:09pm",
        paymentMethod: "Crypto",
        id: "0x23bhs99992ss3e2wsq",
        token: "USDC",
        blockchain: "BASE",
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
    ],
  },
];

export function TransactionsMobile() {
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<DetailsData | null>(null);

  const handleItemClick = (tx: DetailsData) => {
    setSelectedData(tx);
    setOpen(true);
  };

  return (
    <div className="md:hidden relative pb-24">
      {/* Search + Filter */}
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
      </div>

      {months.map((m) => (
        <Card key={m.month} className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">{m.month}</CardTitle>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
              <span>In: {m.inTotal}</span>
              <span>Out: {m.outTotal}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="flex flex-col gap-4">
              {m.items.map((tx, idx) => (
                <li key={idx} className="flex items-start justify-between cursor-pointer hover:bg-gray-800 py-4 px-3 rounded" onClick={() => handleItemClick(tx)}>
                  <div className="flex-1 pr-3">
                    <div className="text-base font-medium">{tx.receiver}</div>
                    <div className="mt-1 flex items-center gap-1 text-[13px] text-blue-300">
                      <span>{tx.receiverAddress}</span>
                      <Copy className="h-3.5 w-3.5" />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{tx.paidOn}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-semibold">{tx.amountPaid}</div>
                    <div className="mt-2">
                      <Badge className="bg-green-900 text-green-200 px-2 py-0.5 text-xs">
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
        <button onClick={() => (window.location.href = '/transactions/create')} className="w-full h-12 rounded-md bg-primary text-primary-foreground text-base font-medium">Create Transaction</button>
      </div>
      <DetailsSheet open={open} onOpenChange={setOpen} data={selectedData} />
    </div>
  );
}
