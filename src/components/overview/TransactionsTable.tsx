import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Filter, Search } from "lucide-react";

const transactions = [
  {
    date: "04 Sept. 2025",
    customer: "Eze Emmanuella",
    method: "Crypto",
    currency: "USDC/ASSET",
    icon: "/usdc-icon.png",
    wallet: "usdt..e723648475",
    amount: "200 USDC",
    status: "Completed",
  },
  {
    date: "04 Sept. 2025",
    customer: "Eze Emmanuella",
    method: "Fiat",
    currency: "USDT",
    icon: "/usdt-icon.png",
    wallet: "usdt..e723648475",
    amount: "200 USDC",
    status: "Completed",
  },
  {
    date: "04 Sept. 2025",
    customer: "Eze Emmanuella",
    method: "Crypto",
    currency: "USDC/ASSET",
    icon: "/usdc-icon.png",
    wallet: "72364847565",
    amount: "200 USDC",
    status: "Completed",
  },
];

const statusColor = {
  Pending: "bg-yellow-900 text-yellow-200",
  Completed: "bg-green-900 text-green-200",
} as const;

function MobileList() {
  return (
    <Card className="md:hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Transactions</CardTitle>
        <span className="text-xs text-muted-foreground">View All &gt;</span>
      </CardHeader>
      <CardContent>
        {/* Search + Filter */}
        <div className="flex items-center gap-2 mb-3">
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

        <ul className="flex flex-col gap-4">
          {transactions.map((tx, idx) => (
            <li key={idx} className="flex items-start justify-between">
              <div className="flex-1 pr-3">
                <div className="text-sm font-medium">{tx.customer}</div>
                <div className="mt-1 flex items-center gap-1 text-[13px] text-blue-300">
                  <span>{tx.wallet}</span>
                  <Copy className="h-3.5 w-3.5" />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{tx.date}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{tx.amount}</div>
                <div className="mt-2">
                  <Badge className={`${statusColor[tx.status as keyof typeof statusColor]} px-2 py-0.5 text-xs`}>
                    {tx.status}
                  </Badge>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function DesktopTable() {
  return (
    <Card className="hidden md:block">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search"
                className="bg-background border border-border rounded pl-9 pr-3 py-1 text-sm w-full"
              />
            </div>
            <button className="flex items-center gap-1 bg-background border border-border rounded px-3 py-1 text-sm">
              <span>Filter</span>
            </button>
          </div>
          <button className="ml-auto bg-background border border-border rounded px-3 py-1 text-sm flex items-center gap-1">
            Export CSV <span className="ml-1">↗</span>
          </button>
        </div>
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
              {transactions.map((tx, idx) => (
                <TableRow key={idx}>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell>{tx.method}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img src={tx.icon} alt={tx.currency} className="w-6 h-6 rounded-full" />
                      <span>{tx.currency}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-blue-300 cursor-pointer">{tx.wallet}</span>
                      <Copy className="w-3 h-3 cursor-pointer" />
                    </div>
                  </TableCell>
                  <TableCell>{tx.amount}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor[tx.status as keyof typeof statusColor]}`}>{tx.status}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 text-xs text-muted-foreground">
          <span>Showing {transactions.length} entries</span>
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
  );
}

export function TransactionsTable() {
  return (
    <div>
      <MobileList />
      <DesktopTable />
    </div>
  );
}
