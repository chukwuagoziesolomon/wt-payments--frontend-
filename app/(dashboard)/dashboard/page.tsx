import { SummaryCards } from "../../../src/components/overview/SummaryCards";
import { AnalyticalTransactionChart } from "../../../src/components/overview/AnalyticalTransactionChart";
import { AvailableAssetCard } from "../../../src/components/overview/AvailableAssetCard";
import { WithdrawalsCard } from "../../../src/components/overview/WithdrawalsCard";
import { PayoutPieChart } from "../../../src/components/overview/PayoutPieChart";
import { TransactionsTable } from "../../../src/components/overview/TransactionsTable";
import { DashboardHeader } from "../../../src/components/overview/DashboardHeader";

export default function DashboardPage() {
  return (
    <main className="p-4">
      <DashboardHeader />
      <SummaryCards />
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <AnalyticalTransactionChart />
        </div>
        <AvailableAssetCard />
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <WithdrawalsCard />
        <PayoutPieChart />
      </div>
      <div className="mt-6">
        <TransactionsTable />
      </div>
      {/* Add other dashboard sections below */}
    </main>
  );
}