import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Filter } from "lucide-react";

const rows = [
  { date: "04 Sept. 2025", method: "Crypto", currency: "USDC/BASE", icon: "/images/usdcbase.png", wallet: "usdt..e723648475", amount: 200, status: "Pending" },
  { date: "04 Sept. 2025", method: "Fiat", currency: "USDT/ASSET", icon: "/images/usdtasset.png", wallet: "usdt..e723648475", amount: 200, status: "Completed" },
  { date: "04 Sept. 2025", method: "Crypto", currency: "USDC/BASE", icon: "/images/usdcbase.png", wallet: "72364847565", amount: 200, status: "Completed" },
  { date: "04 Sept. 2025", method: "Fiat", currency: "USDT/ASSET", icon: "/images/usdtasset.png", wallet: "72364847565", amount: 200, status: "Completed" },
  { date: "04 Sept. 2025", method: "Crypto", currency: "USDC/BASE", icon: "/images/usdcbase.png", wallet: "usdt..e723648475", amount: 200, status: "Completed" },
];

const statusClass = {
  Pending: "bg-yellow-900 text-yellow-200",
  Completed: "bg-green-900 text-green-200",
} as const;

export function PayoutHistoryTable() {
  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        {/* Title and Tabs Row */}
        <div className="flex flex-col space-y-3">
          <CardTitle className="text-base font-semibold text-left">Payout History</CardTitle>

          {/* Tab Filters */}
          <div className="flex items-center gap-6">
            <button className="text-sm font-medium text-primary border-b-2 border-primary pb-1">All (6)</button>
            <button className="text-sm text-muted-foreground hover:text-foreground pb-1">Crypto (3)</button>
            <button className="text-sm text-muted-foreground hover:text-foreground pb-1">Fiat (2)</button>
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
              {rows.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.method}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img src={row.icon} alt={row.currency} className="w-6 h-6 rounded-full" />
                      <span>{row.currency}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-blue-300 cursor-pointer">{row.wallet}</span>
                      <Copy className="w-3 h-3" />
                    </div>
                  </TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusClass[row.status as keyof typeof statusClass]}`}>{row.status}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span>Showing {rows.length} entries</span>
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
    </div>
  );
}

