import { WalletSummaryCards } from "../../../../src/components/wallet/WalletSummaryCards";
import { WithdrawalHistoryTable } from "../../../../src/components/wallet/WithdrawalHistoryTable";

export default function WalletPage() {
  return (
    <main className="p-4">
      <WalletSummaryCards />
      <div className="mt-6">
        <WithdrawalHistoryTable />
      </div>
    </main>
  );
}
