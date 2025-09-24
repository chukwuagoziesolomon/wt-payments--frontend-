import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Filter, Search } from "lucide-react";

type Tx = {
  customer: string;
  wallet: string;
  amount: string;
  status: "Completed" | "Pending";
  dateTime: string;
};

const months: Array<{
  month: string;
  inTotal: string;
  outTotal: string;
  items: Tx[];
}> = [
  {
    month: "Sept 2025",
    inTotal: "$100",
    outTotal: "$200",
    items: [
      {
        customer: "Eze Emmanuella",
        wallet: "usdt..e72364847",
        amount: "200 USDC",
        status: "Completed",
        dateTime: "4th Sept, 18:09pm",
      },
      {
        customer: "Eze Emmanuella",
        wallet: "usdt..e72364847",
        amount: "200 USDC",
        status: "Completed",
        dateTime: "4th Sept, 18:09pm",
      },
      {
        customer: "Eze Emmanuella",
        wallet: "usdt..e72364847",
        amount: "200 USDC",
        status: "Completed",
        dateTime: "4th Sept, 18:09pm",
      },
    ],
  },
  {
    month: "Aug 2025",
    inTotal: "$100",
    outTotal: "$200",
    items: [
      {
        customer: "Eze Emmanuella",
        wallet: "usdt..e72364847",
        amount: "200 USDC",
        status: "Completed",
        dateTime: "4th Sept, 18:09pm",
      },
    ],
  },
];

export function TransactionsMobile() {
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
                <li key={idx} className="flex items-start justify-between">
                  <div className="flex-1 pr-3">
                    <div className="text-base font-medium">{tx.customer}</div>
                    <div className="mt-1 flex items-center gap-1 text-[13px] text-blue-300">
                      <span>{tx.wallet}</span>
                      <Copy className="h-3.5 w-3.5" />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{tx.dateTime}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-semibold">{tx.amount}</div>
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
        <button className="w-full h-12 rounded-md bg-primary text-primary-foreground text-base font-medium">Create Transaction</button>
      </div>
    </div>
  );
}
