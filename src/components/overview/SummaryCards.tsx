import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, CircleDollarSign, Activity } from "lucide-react";

export function SummaryCards() {
  return (
    <div>
      {/* Mobile: horizontal carousel */}
      <div className="md:hidden -mx-4 px-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="flex gap-4 snap-x snap-mandatory">
          <Card className="min-w-[260px] snap-start">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="w-4 h-4 text-purple-400" />
                Total Wallet Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$205</div>
              <div className="text-xs text-muted-foreground">= 0.00008193 BTC</div>
              <div className="flex items-center gap-1 mt-2">
                <Badge variant="secondary">↑ 2%</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-[260px] snap-start">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CircleDollarSign className="w-4 h-4 text-yellow-400" />
                Total Payout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$150</div>
              <div className="text-sm text-muted-foreground">= 0.00000183 BTC</div>
              <div className="flex items-center gap-1 mt-2">
                <Badge variant="secondary">↑ 2%</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-[260px] snap-start">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-400" />
                Total Payment Processed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$120</div>
              <div className="text-sm text-muted-foreground">= 0.00000183 BTC</div>
              <div className="flex items-center gap-1 mt-2">
                <Badge variant="secondary">↑ 2%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Desktop: 3-column grid */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4 text-purple-400" />
              Total Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$205</div>
            <div className="text-sm text-muted-foreground">= 0.00008193 BTC</div>
            <div className="flex items-center gap-1 mt-2">
              <Badge variant="secondary">↑ 2%</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CircleDollarSign className="w-4 h-4 text-yellow-400" />
              Total Payout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$150</div>
            <div className="text-xs text-muted-foreground">= 0.00000183 BTC</div>
            <div className="flex items-center gap-1 mt-2">
              <Badge variant="secondary">↑ 2%</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-400" />
              Total Payment Processed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$120</div>
            <div className="text-xs text-muted-foreground">= 0.00000183 BTC</div>
            <div className="flex items-center gap-1 mt-2">
              <Badge variant="secondary">↑ 2%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
