import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PayoutSummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Payout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$205</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$105</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Current Pending Interval</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$20</div>
        </CardContent>
      </Card>
    </div>
  );
}
