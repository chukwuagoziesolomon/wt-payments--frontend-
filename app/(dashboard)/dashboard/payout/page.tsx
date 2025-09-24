import { PayoutSummaryCards } from "../../../../src/components/payout/PayoutSummaryCards";
import { PayoutHistoryTable } from "../../../../src/components/payout/PayoutHistoryTable";

export default function PayoutPage() {
  return (
    <main className="p-4">
      <PayoutSummaryCards />
      <div className="mt-6">
        <PayoutHistoryTable />
      </div>
    </main>
  );
}
