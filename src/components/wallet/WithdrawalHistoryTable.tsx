import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Filter, Search } from "lucide-react";

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

function DesktopTable() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Withdrawal History</CardTitle>
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

function MobileList() {
  const months = [
    {
      month: "Sept 2025",
      inTotal: "$100",
      outTotal: "$200",
      items: rows,
    },
    {
      month: "Aug 2025",
      inTotal: "$100",
      outTotal: "$200",
      items: rows.slice(0, 1),
    },
  ];

  return (
    <div className="md:hidden relative pb-24">
      {/* Tabs */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <div className="flex items-center gap-4">
          <button className="font-medium text-foreground">All (5)</button>
          <button>Crypto (3)</button>
          <button>Fiat (2)</button>
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
                <li key={idx} className={`flex items-start justify-between py-3 ${idx !== m.items.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="flex-1 pr-3">
                    <div className="text-base font-medium">{tx.method}</div>
                    <div className="mt-1 flex items-center gap-1 text-[13px] text-blue-300">
                      <span>{tx.wallet}</span>
                      <Copy className="h-3.5 w-3.5" />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{tx.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-semibold">{tx.amount} </div>
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
        <button className="w-full h-12 rounded-md bg-primary text-primary-foreground text-base font-medium">Withdraw</button>
      </div>
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
