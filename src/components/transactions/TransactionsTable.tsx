import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy } from "lucide-react";

const rows = [
  { date: "4th Sept, 2025", customer: "Eze Emmanuella", currency: "USDC/ASSET", icon: "/usdc-icon.png", wallet: "usdt..e72364847", amount: 200, status: "Pending" },
  { date: "4th Sept, 2025", customer: "Ebube Kelvin", currency: "USDC/ASSET", icon: "/usdc-icon.png", wallet: "usdt..e72364847", amount: 200, status: "Completed" },
  { date: "4th Sept, 2025", customer: "Eze Emmanuella", currency: "USDC/ASSET", icon: "/usdc-icon.png", wallet: "usdt..e72364847", amount: 200, status: "Completed" },
  { date: "4th Sept, 2025", customer: "Ebube Kelvin", currency: "USDC/ASSET", icon: "/usdc-icon.png", wallet: "usdt..e72364847", amount: 200, status: "Completed" },
  { date: "4th Sept, 2025", customer: "Ebube Kelvin", currency: "USDC/ASSET", icon: "/usdc-icon.png", wallet: "usdt..e72364847", amount: 200, status: "Completed" },
  { date: "4th Sept, 2025", customer: "Ebube Kelvin", currency: "USDC/ASSET", icon: "/usdc-icon.png", wallet: "usdt..e72364847", amount: 200, status: "Completed" },
  { date: "4th Sept, 2025", customer: "Ebube Kelvin", currency: "USDC/ASSET", icon: "/usdc-icon.png", wallet: "usdt..e72364847", amount: 200, status: "Completed" },
];

const statusClass = {
  Pending: "bg-yellow-900 text-yellow-200",
  Completed: "bg-green-900 text-green-200",
} as const;

export function TransactionsTable() {
  return (
    <div className="relative">
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pb-2">
          <CardTitle className="text-base font-semibold">Transaction</CardTitle>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search"
              className="bg-background border border-border rounded px-3 py-1 text-sm w-full md:w-56"
            />
            <button className="bg-background border border-border rounded px-3 py-1 text-sm">Filter</button>
            <button className="hidden md:inline-flex bg-primary text-primary-foreground rounded px-3 py-1 text-sm">Create Transaction</button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
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
                  <TableRow key={i}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.customer}</TableCell>
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
        <button className="w-full h-12 rounded-md bg-primary text-primary-foreground text-base font-medium">Create Transaction</button>
      </div>
    </div>
  );
}
