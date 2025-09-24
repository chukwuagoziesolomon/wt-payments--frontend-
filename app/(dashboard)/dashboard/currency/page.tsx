import { CurrencyTable } from "../../../../src/components/currency/CurrencyTable";
import { CurrencyMobile } from "../../../../src/components/currency/CurrencyMobile";

export default function CurrencyPage() {
  return (
    <main className="p-4">
      <div className="hidden md:block">
        <CurrencyTable />
      </div>
      <CurrencyMobile />
    </main>
  );
}
