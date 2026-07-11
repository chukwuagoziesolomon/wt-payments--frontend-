"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Info, ArrowDownLeft, Percent, Network, Clock } from "lucide-react";

export function FiatWithdrawalForm({ onShowOtp }: { onShowOtp?: () => void }) {
  // Demo state for selects and amount
  const [amount, setAmount] = React.useState(20);
  const balance = 130;
  const min = 0;
  const max = 130;

  // Demo bank details
  const accountName = "Eze Emmanuella Chu...";
  const accountNumber = "3459864211";
  const bankName = "FirstCity Moment";

  // Helper to detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const router = typeof window !== 'undefined' ? require('next/navigation').useRouter() : null;

  return (
    <>
      {/* Bank account details */}
      <div className="rounded-xl border border-border bg-[#19191d] mb-6">
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <span className="text-lg font-semibold">Bank account details</span>
          <Button variant="outline" className="h-9 px-4 py-1 text-base font-medium border border-border">Manage</Button>
        </div>
        {/* Mobile only: border after header */}
        <div className="block sm:hidden border-b border-border mx-6 mb-0.5" />
        {/* Mobile: vertical with borders, Desktop: original flex */}
        <div className="block sm:flex px-0 sm:px-6 pb-4 gap-0 sm:gap-8">
          <div className="sm:flex-1 sm:min-w-0">
            <div className="px-6 py-3 sm:p-0 border-b border-border sm:border-0">
              <div className="text-sm text-muted-foreground">Account Name</div>
              <div className="text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{accountName}</div>
            </div>
            <div className="px-6 py-3 sm:p-0 border-b border-border sm:border-0">
              <div className="text-sm text-muted-foreground">Bank Name</div>
              <div className="text-lg font-semibold">{bankName}</div>
            </div>
          </div>
          <div className="px-6 py-3 sm:p-0 flex flex-col items-start sm:items-end justify-center min-w-[140px] border-b-0 border-border sm:border-0">
            <div className="text-sm text-muted-foreground">Account Number</div>
            <div className="text-lg font-semibold">{accountNumber}</div>
          </div>
        </div>
        {/* Mobile only: border after all details */}
        <div className="block sm:hidden border-b border-border mx-6" />
      </div>

      {/* Asset select */}
      <div className="rounded-xl border border-border bg-[#19191d] mb-6 px-6 py-4">
        <div className="text-base text-white font-medium mb-2">Asset</div>
        <div className="flex items-center gap-2">
          <img src="/images/usdtasset.png" alt="USDT" className="w-6 h-6 rounded-full" />
          <span className="font-medium text-white">USDT</span>
        </div>
      </div>

      {/* Amount input */}
      <div className="rounded-xl border border-border bg-[#19191d] mb-2 px-6 py-4">
        <div className="text-base text-white font-medium mb-2">Enter amount</div>
        <div className="flex items-center justify-between">
          <input
            type="number"
            min={min}
            max={max}
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            className="border-0 bg-transparent px-0 text-2xl font-bold w-24 focus:outline-none text-white text-left"
          />
          <div className="flex flex-col items-end gap-1 min-w-[70px]">
            <span className="text-xs text-muted-foreground">Bal: {balance} USD</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">USD</span>
            </div>
          </div>
        </div>
      </div>
      {/* Progress bar and min/max labels outside the card */}
      <div className="flex flex-col mb-6">
        <div className="flex items-center gap-0 w-full">
          {[0,1,2,3].map((i) => (
            <React.Fragment key={i}>
              <span className="w-4 h-4 rounded-full bg-[#23243a] border-2 border-[#bcbcff] flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-[#bcbcff] block"></span>
              </span>
              {i < 3 && <span className="flex-1 h-1 bg-[#23243a]" />}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Min</span>
          <span>Max</span>
        </div>
      </div>

      {/* Gold alert/info box */}
      <div className="rounded-md border border-yellow-700 bg-yellow-900/20 p-4 flex items-center gap-3 mb-2">
        <Info className="w-5 h-5 text-yellow-400" />
        <span className="text-yellow-200 text-sm">This is a demo info box. You can add instructions or warnings here.</span>
      </div>

      {/* Summary section with icons */}
      <div className="space-y-2 text-sm text-muted-foreground bg-[#19191d] rounded-md border border-border p-4 mb-8">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2"><ArrowDownLeft className="w-4 h-4 text-primary" />Amount to receive</span>
          <span className="text-white font-semibold">17 USDT</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2"><Percent className="w-4 h-4 text-primary" />Transaction fee</span>
          <span className="text-white font-semibold">1 USDT</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2"><Network className="w-4 h-4 text-primary" />Estimated network fee</span>
          <span className="text-white font-semibold">3 USDT</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />Expected arrival time</span>
          <span className="text-white font-semibold">≈1 min</span>
        </div>
      </div>

      <Button
        className="w-full bg-[#6c5dd3] text-white text-base font-semibold py-3 rounded-md mb-2"
        onClick={e => {
          e.preventDefault();
          if (typeof window !== 'undefined' && window.innerWidth < 640 && router) {
            router.push('/dashboard/wallet/withdraw/otp-page');
          } else {
            onShowOtp && onShowOtp();
          }
        }}
      >
        Transfer <span className="font-bold">17 USDT</span>
      </Button>
    </>
  );
}
