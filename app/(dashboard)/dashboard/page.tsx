import { AnalyticalTransactionChart } from "../../../src/components/overview/AnalyticalTransactionChart";
import { AvailableAssetCard } from "../../../src/components/overview/AvailableAssetCard";
import { DashboardHeader } from "../../../src/components/overview/DashboardHeader";
import { PayoutPieChart } from "../../../src/components/overview/PayoutPieChart";
import { SummaryCards } from "../../../src/components/overview/SummaryCards";
import { TransactionsTable } from "../../../src/components/overview/TransactionsTable";
import { WithdrawalsCard } from "../../../src/components/overview/WithdrawalsCard";

export default function DashboardPage() {
  return (
    <main className="p-4">
      <DashboardHeader />
      <SummaryCards />
      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <AnalyticalTransactionChart />
        </div>
        <AvailableAssetCard />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-6 md:grid-cols-2">
        <WithdrawalsCard />
        <PayoutPieChart />
      </div>
      <div className="mt-4 md:mt-6">
        <TransactionsTable />
      </div>
      {/* Add other dashboard sections below */}
    </main>
  );
}
