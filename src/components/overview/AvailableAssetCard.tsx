import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const assets = [
  {
    icon: "/images/usdcbase.png",
    symbol: "USDC/BASE",
    label: "Asset",
    amount: "40 USDC",
    value: "$41",
  },
  {
    icon: "/images/usdtasset.png",
    symbol: "USDT/ASSET",
    label: "Asset",
    amount: "25 USDT",
    value: "$25",
  },
  {
    icon: "/images/usdcbase.png",
    symbol: "USDC/BASE",
    label: "Asset",
    amount: "100 USDC",
    value: "$100",
  },
];

export function AvailableAssetCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Available Asset</CardTitle>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          View All <span className="ml-1">&gt;</span>
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {assets.map((asset, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={asset.icon} alt={asset.symbol} className="w-8 h-8 rounded-full" />
                <div>
                  <div className="font-medium">{asset.symbol}</div>
                  <div className="text-xs text-muted-foreground">{asset.label}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{asset.amount}</div>
                <div className="text-xs text-muted-foreground">{asset.value}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
