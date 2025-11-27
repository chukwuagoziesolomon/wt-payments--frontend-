"use client"

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, Info, DollarSign, ArrowDownLeft, Percent, Network, Clock, Copy, Shield } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/ToastProvider";
import { WaitingForPaymentModal } from "@/components/WaitingForPaymentModal";
import { EmailVerificationModal } from "@/src/components/EmailVerificationModal";

export default function CreateTransactionPage() {
  const router = useRouter();

  // Modal state
  const [modalOpen, setModalOpen] = React.useState(false);
  // Email verification modal state
  const [showEmailModal, setShowEmailModal] = React.useState(false);
  // Use global toast
  const { notify } = useToast();
  // Waiting modal state
  const [waitingOpen, setWaitingOpen] = React.useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowEmailModal(true);
  }

  // Demo state for selects and amount
  const [blockchain, setBlockchain] = React.useState("Asset Chain");
  const [asset, setAsset] = React.useState("USDT");
  const [amount, setAmount] = React.useState(20);
  const balance = 130;
  const min = 0;
  const max = 130;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mx-auto">
          <div className="border-2 border-blue-600 rounded-lg p-0 shadow-xl" style={{boxShadow: '0 0 0 1.5px #4f4f8f'}}>
            <div className="px-0 pt-0">
              <div className="text-center text-lg font-semibold py-6 border-b border-[#23243a] tracking-wide">Create Transaction</div>
            </div>
            <form onSubmit={onSubmit} className="bg-[#17171a] px-8 py-8 space-y-6 rounded-b-lg">
              {/* Blockchain select */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Blockchain</label>
                <div className="rounded-md border border-border p-4 flex items-center justify-between bg-[#19191d]">
                  <div className="flex items-center gap-2">
                    <img src="/images/assetchain.png" alt="Asset Chain" className="w-6 h-6 rounded-full" />
                    <span className="font-medium">{blockchain}</span>
                  </div>
                  <button type="button" className="text-primary flex items-center"><ChevronDown className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Asset select */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Asset</label>
                <div className="rounded-md border border-border p-4 flex items-center justify-between bg-[#19191d]">
                  <div className="flex items-center gap-2">
                    <img src="/images/usdtasset.png" alt="USDT" className="w-6 h-6 rounded-full" />
                    <span className="font-medium">{asset}</span>
                  </div>
                  <button type="button" className="text-primary flex items-center"><ChevronDown className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Enter amount</label>
                <div className="rounded-md border border-border p-4 flex items-center justify-between bg-[#19191d]">
                  {/* Amount input left */}
                  <input
                    type="number"
                    min={min}
                    max={max}
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="border-0 bg-transparent px-0 text-lg font-semibold w-24 focus:outline-none text-white text-left"
                  />
                  {/* Balance and asset right, stacked */}
                  <div className="flex flex-col items-end gap-1 min-w-[70px]">
                    <span className="text-xs text-muted-foreground">Bal: {balance} USDT</span>
                    <div className="flex items-center gap-2">
                      <img src="/images/usdtasset.png" alt="USDT" className="w-6 h-6 rounded-full" />
                      <span className="font-medium text-white">USDT</span>
                    </div>
                  </div>
                </div>
                {/* Custom progress/slider bar with 4 circles and 3 lines */}
                <div className="flex items-center gap-0 mt-4 w-full">
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
              <div className="space-y-2 text-sm text-muted-foreground bg-[#19191d] rounded-md border border-border p-4">
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

              <div className="pt-4">
                <Button type="submit" className="w-full bg-[#6c5dd3] text-white text-base font-semibold py-3 rounded-md">Create payment of $130</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Email verification modal */}
      <EmailVerificationModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        email="ezeemma....@gmail.com"
        onVerify={code => {
          setShowEmailModal(false);
          setWaitingOpen(true);
          setTimeout(() => {
            setWaitingOpen(false);
            router.push('/transactions');
          }, 3000);
        }}
        onResend={() => notify('Verification code resent!')}
      />
      {/* Waiting for payment modal */}
      <WaitingForPaymentModal open={waitingOpen} onClose={() => setWaitingOpen(false)} />
    </div>
  );
}
