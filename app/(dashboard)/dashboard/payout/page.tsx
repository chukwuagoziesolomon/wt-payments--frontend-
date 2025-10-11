import { PayoutSummaryCards } from "../../../../src/components/payout/PayoutSummaryCards";
import { PayoutHistoryTable } from "../../../../src/components/payout/PayoutHistoryTable";
import { PayoutFilterSection } from "../../../../src/components/payout/PayoutFilterSection";

export default function PayoutPage() {
  return (
    <main className="p-4">
      <PayoutFilterSection />
      <PayoutSummaryCards />
      <div className="mt-6">
        <PayoutHistoryTable />
      </div>
    </main>
  );
}
