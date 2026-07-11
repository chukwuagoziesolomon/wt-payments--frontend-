import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy } from "lucide-react";

const rows = [
  { date: "04 Sept. 2025", method: "Crypto", currency: "USDC/ASSET", icon: "/usdc-icon.png", wallet: "usdt..e723648475", amount: 200, status: "Pending" },
  { date: "04 Sept. 2025", method: "Fiat", currency: "USDT", icon: "/usdt-icon.png", wallet: "usdt..e723648475", amount: 200, status: "Completed" },
  { date: "04 Sept. 2025", method: "Crypto", currency: "USDC/ASSET", icon: "/usdc-icon.png", wallet: "72364847565", amount: 200, status: "Completed" },
  { date: "04 Sept. 2025", method: "Fiat", currency: "USDT", icon: "/usdt-icon.png", wallet: "72364847565", amount: 200, status: "Completed" },
  { date: "04 Sept. 2025", method: "Crypto", currency: "USDC/ASSET", icon: "/usdc-icon.png", wallet: "usdt..e723648475", amount: 200, status: "Completed" },
];

const statusClass = {
  Pending: "bg-yellow-900 text-yellow-200",
  Completed: "bg-green-900 text-green-200",
} as const;

export function PayoutHistoryTable() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Payout History</CardTitle>
        <div className="flex gap-2">
          <input className="bg-background border border-border rounded px-3 py-1 text-sm" placeholder="Search" />
          <button className="bg-background border border-border rounded px-3 py-1 text-sm">Filter</button>
          <button className="bg-background border border-border rounded px-3 py-1 text-sm">Export CSV ↗</button>
        </div>
      </CardHeader>
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
  );
}
