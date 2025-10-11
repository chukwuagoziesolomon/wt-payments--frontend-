import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy } from "lucide-react";

const withdrawals = [
  {
    date: "04 Sept. 2025",
    asset: "USDC/BASE",
    icon: "/images/usdcbase.png",
    amount: "-200 USDC",
    amountClass: "text-red-500",
    wallet: "usdt..e723648475",
  },
  {
    date: "04 Sept. 2025",
    asset: "USDT/ASSET",
    icon: "/images/usdtasset.png",
    amount: "-$200",
    amountClass: "text-red-500",
    wallet: "72364847565",
  },
  {
    date: "04 Sept. 2025",
    asset: "USDC/BASE",
    icon: "/images/usdcbase.png",
    amount: "-200 USDC",
    amountClass: "text-red-500",
    wallet: "usdt..e723648475",
  },
  {
    date: "04 Sept. 2025",
    asset: "USDT/ASSET",
    icon: "/images/usdtasset.png",
    amount: "-200 USDT",
    amountClass: "text-red-500",
    wallet: "usdt..e723648475",
  },
];

export function WithdrawalsCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Withdrawals</CardTitle>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          View All <span className="ml-1">&gt;</span>
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {withdrawals.map((w, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{w.date}</div>
                <div className="flex items-center gap-2 mt-1">
                  <img src={w.icon} alt={w.asset} className="w-6 h-6 rounded-full" />
                  <div className="text-xs text-muted-foreground">{w.asset}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-medium text-sm ${w.amountClass}`}>{w.amount}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                  {w.wallet}
                  <Copy className="w-3 h-3 cursor-pointer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
