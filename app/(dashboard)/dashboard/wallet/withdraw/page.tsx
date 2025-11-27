"use client"
import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FiatWithdrawalForm } from "@/src/components/wallet/FiatWithdrawalForm";
import { NoBankAccountModal } from "@/src/components/wallet/NoBankAccountModal";
import { WithdrawalOtpModal } from "@/src/components/wallet/WithdrawalOtpModal";
import { SelectBlockchainSheet } from "@/src/components/wallet/SelectBlockchainSheet";
import { SelectAssetSheet } from "@/src/components/wallet/SelectAssetSheet";
// Demo blockchain icon (replace with real icon as needed)
function UsdtIcon() {
  return (
    <span className="inline-block w-6 h-6 bg-[#23242A] rounded-full flex items-center justify-center">
      <img src="/images/usdtasset.png" alt="USDT" className="w-6 h-6 rounded-full" />
    </span>
  );
}
function AssetChainIcon() {
  return (
    <span className="inline-block w-6 h-6 bg-[#23242A] rounded-full flex items-center justify-center">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#6C5DD3"/><path d="M6.5 10h7M10 6.5v7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
    </span>
  );
}
import { Button } from "@/components/ui/button";
import { ChevronDown, Info, DollarSign, ArrowDownLeft, Percent, Network, Clock, Copy, Shield } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/ToastProvider";
import { WaitingForPaymentModal } from "@/components/WaitingForPaymentModal";

export default function WithdrawPage() {
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // setModalOpen(false); // removed: not defined or used
    setWaitingOpen(true);
    setTimeout(() => {
      setWaitingOpen(false);
      router.push('/dashboard/wallet');
    }, 3000);
  }

  // Tab state: 'crypto' | 'fiat'
  const [mode, setMode] = React.useState<'crypto' | 'fiat'>('crypto');

  // Demo state for selects and amount
  // Demo: set to false to show the no-bank-account modal for fiat
  const [hasBankAccount, setHasBankAccount] = React.useState(true);
  const [blockchain, setBlockchain] = React.useState("Asset Chain");
  const [blockchainSheetOpen, setBlockchainSheetOpen] = React.useState(false);
  const [asset, setAsset] = React.useState("USDT");
  const [assetSheetOpen, setAssetSheetOpen] = React.useState(false);
  const [amount, setAmount] = React.useState(20);
  const balance = 130;
  const min = 0;
  const max = 130;
  // OTP modal state
  const [showOtpModal, setShowOtpModal] = React.useState(false);
  // Use global toast
  const { notify } = useToast();
  // Waiting modal state
  const [waitingOpen, setWaitingOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background px-0 pt-0 pb-8 flex flex-col">
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl mx-auto">
        <div className="pt-4">
          <div className="rounded-2xl bg-[#17171a] shadow-none border border-border">
            <div className="px-5 pt-4">
              <div className="text-left text-xl font-bold pb-4">Make a Withdrawal</div>
            </div>



            {/* Crypto / Fiat pill-style toggle */}
            <div className="flex justify-center px-5 pb-0">
                <div className="flex rounded-lg bg-[#19191d] w-full h-10">
                <button
                  className={`flex-1 rounded-lg text-sm font-semibold transition-colors duration-150
                    ${mode === 'crypto' ? 'bg-[#23243a] text-white shadow-inner' : 'bg-transparent text-muted-foreground'}
                  `}
                  style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                  onClick={() => setMode('crypto')}
                  type="button"
                >
                  Crypto
                </button>
                <button
                  className={`flex-1 rounded-lg text-sm font-semibold transition-colors duration-150
                    ${mode === 'fiat' ? 'bg-[#23243a] text-white shadow-inner' : 'bg-transparent text-muted-foreground'}
                  `}
                  style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                  onClick={() => setMode('fiat')}
                  type="button"
                >
                  Fiat
                </button>
              </div>
            </div>

            <form onSubmit={onSubmit} className="bg-[#17171a] px-5 py-6 space-y-6 rounded-b-2xl">
              {mode === 'crypto' ? (
                <>
                  {/* Blockchain select */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Blockchain</label>
                    <div className="rounded-lg border border-border p-3 flex items-center justify-between bg-[#19191d]">
                      <div className="flex items-center gap-2">
                          <AssetChainIcon />
                          <span className="font-medium">{blockchain}</span>
                      </div>
                        <button type="button" className="text-primary flex items-center" onClick={() => setBlockchainSheetOpen(true)}><ChevronDown className="w-5 h-5" /></button>
                    </div>
                  </div>
                  {/* Blockchain selection sheet */}
                  <SelectBlockchainSheet
                    open={blockchainSheetOpen}
                    onClose={() => setBlockchainSheetOpen(false)}
                    options={[
                      { label: "Asset Chain", value: "Asset Chain", icon: <AssetChainIcon /> },
                      { label: "Asset Chain", value: "Asset Chain 2", icon: <AssetChainIcon /> },
                      { label: "Asset Chain", value: "Asset Chain 3", icon: <AssetChainIcon /> },
                    ]}
                    onSelect={val => {
                      setBlockchain(val);
                      setBlockchainSheetOpen(false);
                      setAssetSheetOpen(true);
                    }}
                  />
                  <SelectAssetSheet
                    open={assetSheetOpen}
                    onClose={() => setAssetSheetOpen(false)}
                    options={[
                      { label: "USDT", value: "USDT", icon: <UsdtIcon /> },
                      { label: "USDT", value: "USDT2", icon: <UsdtIcon /> },
                      { label: "USDT", value: "USDT3", icon: <UsdtIcon /> },
                    ]}
                    onSelect={val => {
                      setAsset(val);
                      setAssetSheetOpen(false);
                    }}
                  />

                  {/* Asset select */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Asset</label>
                    <div className="rounded-lg border border-border p-3 flex items-center justify-between bg-[#19191d]">
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
                    <div className="rounded-lg border border-border p-3 flex items-center justify-between bg-[#19191d]">
                      <input
                        type="number"
                        min={min}
                        max={max}
                        value={amount}
                        onChange={e => setAmount(Number(e.target.value))}
                        className="border-0 bg-transparent px-0 text-lg font-semibold w-24 focus:outline-none text-white text-left"
                      />
                      <div className="flex flex-col items-end gap-1 min-w-[70px]">
                        <span className="text-xs text-muted-foreground">Bal: {balance} USDT</span>
                        <div className="flex items-center gap-2">
                          <img src="/images/usdtasset.png" alt="USDT" className="w-6 h-6 rounded-full" />
                          <span className="font-medium text-white">USDT</span>
                        </div>
                      </div>
                    </div>

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

                  {/* Remove demo info box for clean look */}

                  <div className="space-y-2 text-sm text-muted-foreground bg-[#19191d] rounded-lg border border-border p-3">
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
                    <Button
                      type="submit"
                      className="w-full bg-[#6c5dd3] text-white text-base font-semibold py-3 rounded-lg"
                    >
                      Create Payment of ${amount}
                    </Button>
                  </div>
                </>
              ) : (
                hasBankAccount ? (
                  <FiatWithdrawalForm onShowOtp={() => setShowOtpModal(true)} />
                ) : null
              )}
      {/* No bank account modal for fiat withdrawal */}
      <NoBankAccountModal
        open={mode === 'fiat' && !hasBankAccount}
        onClose={() => setMode('crypto')}
        onManage={() => {
          setMode('crypto');
          // Add navigation to manage account page if needed
        }}
      />


            </form>
          </div>
        </div>
      </div>

      <WithdrawalOtpModal
        open={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email="ezeemma....@gmail.com"
        onVerify={(code: string) => {
          setShowOtpModal(false);
          setWaitingOpen(true);
          setTimeout(() => {
            setWaitingOpen(false);
            router.push('/dashboard/wallet');
          }, 3000);
        }}
        onResend={() => notify('Verification code resent!')}
      />
      <WaitingForPaymentModal open={waitingOpen} onClose={() => setWaitingOpen(false)} />
    </div>
  );
}
