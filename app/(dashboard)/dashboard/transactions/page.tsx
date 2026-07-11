import { TransactionsTable } from "../../../../src/components/transactions/TransactionsTable";
import { TransactionsMobile } from "../../../../src/components/transactions/TransactionsMobile";

export default function DashboardTransactionsPage() {
  return (
    <main className="p-4">
      <div className="hidden md:block">
        <TransactionsTable />
      </div>
      <div className="md:hidden">
        <TransactionsMobile />
      </div>
    </main>
  );
}
