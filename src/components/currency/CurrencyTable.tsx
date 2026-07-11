import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy } from "lucide-react";

const rows = [
  { token: "USDT", icon: "/usdt-icon.png", chain: "ASSET", address: "usdt..e72364847", status: "Active" },
  { token: "USDC", icon: "/usdc-icon.png", chain: "BASE", address: "usdt..e72364847", status: "Inactive" },
  { token: "USDC", icon: "/usdc-icon.png", chain: "BASE", address: "usdt..e72364847", status: "Active" },
  { token: "USDC", icon: "/usdc-icon.png", chain: "BASE", address: "usdt..e72364847", status: "Inactive" },
  { token: "USDC", icon: "/usdc-icon.png", chain: "BASE", address: "usdt..e72364847", status: "Inactive" },
  { token: "USDT", icon: "/usdt-icon.png", chain: "ASSET", address: "usdt..e72364847", status: "Active" },
  { token: "USDT", icon: "/usdt-icon.png", chain: "ASSET", address: "usdt..e72364847", status: "Active" },
  { token: "USDT", icon: "/usdt-icon.png", chain: "ASSET", address: "usdt..e72364847", status: "Active" },
];

const statusDot = (status: string) => (
  <span
    className={`inline-block w-2 h-2 rounded-full mr-2 ${
      status === "Active" ? "bg-green-400" : "bg-zinc-500"
    }`}
  />
);

export function CurrencyTable() {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pb-2">
        <CardTitle className="text-base font-semibold">Currency</CardTitle>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search"
            className="bg-background border border-border rounded px-3 py-1 text-sm w-full md:w-56"
          />
          <button className="bg-background border border-border rounded px-3 py-1 text-sm">Filter</button>
          <span className="ml-auto text-xs text-muted-foreground hidden md:inline">
            Toggle currencies you want to accept
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Blockchain</TableHead>
                <TableHead>Token Address</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img src={row.icon} alt={row.token} className="w-6 h-6 rounded-full" />
                      <span>{row.token}</span>
                    </div>
                  </TableCell>
                  <TableCell>{row.chain}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-blue-300 cursor-pointer">{row.address}</span>
                      <Copy className="w-3 h-3" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {statusDot(row.status)}
                      <span className="text-sm">{row.status}</span>
                    </div>
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
