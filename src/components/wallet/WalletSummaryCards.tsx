import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WalletSummaryCards() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
          <button className="bg-background border border-border rounded px-3 py-1 text-xs">Withdraw</button>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$205</div>
          <div className="text-xs text-muted-foreground">0.00008193 BTC</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Number of Asset</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3</div>
        </CardContent>
      </Card>
    </div>
  );
}
