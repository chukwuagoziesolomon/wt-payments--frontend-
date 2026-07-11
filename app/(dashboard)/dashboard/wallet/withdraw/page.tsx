"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowDownLeft, Percent, Network, Clock, Info } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { WithdrawalOtpModal } from "@/src/components/wallet/WithdrawalOtpModal";
import { NoBankAccountModal } from "@/src/components/wallet/NoBankAccountModal";
import { SelectBlockchainSheet } from "@/src/components/wallet/SelectBlockchainSheet";
import { SelectAssetSheet } from "@/src/components/wallet/SelectAssetSheet";
import { SectionLoader } from "@/components/ui/LoadingAnimator";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";

function getToken() {
  return localStorage.getItem("authToken") || localStorage.getItem("token") || "";
}

function authHeaders(extra?: Record<string, string>) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...extra };
}

type Quote = {
  amount: number;
  transactionFee: number;
  estimatedNetworkFee: number;
  amountToReceive: number;
  asset: string;
  estimatedArrivalMinutes: number;
  exchangeRate?: number;
  nairaAmountToReceive?: number;
  fiatCurrency?: string;
};

type WalletEntry = { wallet_id: string; balance_usd: number; symbol: string };

function UsdtIcon() {
  return <img src="/images/usdtasset.png" alt="USDT" className="w-6 h-6 rounded-full" />;
}
function AssetChainIcon() {
  return (
    <span className="inline-block w-6 h-6 bg-[#23242A] rounded-full flex items-center justify-center">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#6C5DD3"/><path d="M6.5 10h7M10 6.5v7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
    </span>
  );
}

export default function WithdrawPage() {
  const router = useRouter();
  const { notify } = useToast();

  const [mode, setMode] = React.useState<"crypto" | "fiat">("crypto");

  // Wallet / asset data
  const [wallets, setWallets] = React.useState<WalletEntry[]>([]);
  const [selectedWallet, setSelectedWallet] = React.useState<WalletEntry | null>(null);

  // Crypto fields
  const [recipientAddress, setRecipientAddress] = React.useState("");
  const [blockchainSheetOpen, setBlockchainSheetOpen] = React.useState(false);
  const [assetSheetOpen, setAssetSheetOpen] = React.useState(false);
  const [selectedNetworkId, setSelectedNetworkId] = React.useState("");
  const [selectedNetworkLabel, setSelectedNetworkLabel] = React.useState("Select network");
  const [selectedCurrencyId, setSelectedCurrencyId] = React.useState("");
  const [selectedCurrencyLabel, setSelectedCurrencyLabel] = React.useState("USDT");

  // Fiat fields
  const [hasBankAccount] = React.useState(true);
  const [bankName, setBankName] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [bankCode, setBankCode] = React.useState("");
  const [accountName, setAccountName] = React.useState("");

  // Shared
  const [amount, setAmount] = React.useState<number | "">("");
  const [quote, setQuote] = React.useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = React.useState(false);

  // Flow state
  const [initiating, setInitiating] = React.useState(false);
  const [otpId, setOtpId] = React.useState("");
  const [showOtpModal, setShowOtpModal] = React.useState(false);
  const [otpLoading, setOtpLoading] = React.useState(false);

  // Load wallet balance on mount
  React.useEffect(() => {
    fetch(`${API}/user/wallet/balance`, { headers: authHeaders(), credentials: "include" })
      .then(r => r.json())
      .catch(() => null)
      .then(json => {
        const list: WalletEntry[] = json?.result?.wallets || json?.wallets || [];
        setWallets(list);
        if (list.length > 0) setSelectedWallet(list[0]);
      });
  }, []);

  // Debounced quote fetch
  React.useEffect(() => {
    if (!amount || Number(amount) <= 0) { setQuote(null); return; }
    setQuoteLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API}/user/withdrawal/quote?amount=${amount}&type=${mode}`,
          { headers: authHeaders(), credentials: "include" }
        );
        const json = await res.json().catch(() => null);
        if (json?.status && json?.result) setQuote(json.result);
        else setQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [amount, mode]);

  async function handleInitiate() {
    if (!amount || Number(amount) <= 0) { notify("Enter a valid amount"); return; }
    if (!selectedWallet) { notify("No wallet found"); return; }

    setInitiating(true);
    try {
      const body =
        mode === "crypto"
          ? {
              type: "crypto",
              user_wallet_id: selectedWallet.wallet_id,
              crypto_currency_id: selectedCurrencyId,
              network_id: selectedNetworkId,
              amount: Number(amount),
              recipient_address: recipientAddress,
            }
          : {
              type: "fiat",
              user_wallet_id: selectedWallet.wallet_id,
              amount: Number(amount),
              bank_name: bankName,
              account_number: accountNumber,
              bank_code: bankCode,
              account_name: accountName,
            };

      const res = await fetch(`${API}/user/withdrawal/initiate`, {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.status) {
        notify(json?.message || "Failed to initiate withdrawal");
        return;
      }

      setOtpId(json.result.otp_id);
      setShowOtpModal(true);
    } finally {
      setInitiating(false);
    }
  }

  async function handleConfirm(code: string) {
    setOtpLoading(true);
    try {
      const res = await fetch(`${API}/user/withdrawal/confirm`, {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify({ otp_id: otpId, otp_code: code }),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.status) {
        notify(json?.message || "OTP verification failed");
        return;
      }

      setShowOtpModal(false);
      notify(json.message || "Withdrawal submitted!");
      router.push("/dashboard/wallet");
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleResend() {
    await handleInitiate();
    notify("A new OTP has been sent to your email.");
  }

  const balance = selectedWallet?.balance_usd ?? 0;

  return (
    <div className="min-h-screen bg-background px-0 pt-0 pb-8 flex flex-col">
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl mx-auto">
        <div className="pt-4">
          <div className="rounded-2xl bg-[#17171a] border border-border">
            <div className="px-5 pt-4">
              <div className="text-left text-xl font-bold pb-4">Make a Withdrawal</div>
            </div>

            {/* Crypto / Fiat toggle */}
            <div className="flex justify-center px-5 pb-0">
              <div className="flex rounded-lg bg-[#19191d] w-full h-10">
                {(["crypto", "fiat"] as const).map(m => (
                  <button
                    key={m}
                    className={`flex-1 rounded-lg text-sm font-semibold transition-colors duration-150 ${mode === m ? "bg-[#23243a] text-white shadow-inner" : "bg-transparent text-muted-foreground"}`}
                    onClick={() => setMode(m)}
                    type="button"
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#17171a] px-5 py-6 space-y-5 rounded-b-2xl">

              {/* ── CRYPTO FORM ── */}
              {mode === "crypto" && (
                <>
                  {/* Network / Blockchain */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Network</label>
                    <div className="rounded-lg border border-border p-3 flex items-center justify-between bg-[#19191d]">
                      <div className="flex items-center gap-2">
                        <AssetChainIcon />
                        <span className="font-medium">{selectedNetworkLabel}</span>
                      </div>
                      <button type="button" onClick={() => setBlockchainSheetOpen(true)}><ChevronDown className="w-5 h-5 text-primary" /></button>
                    </div>
                  </div>

                  {/* Asset */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Asset</label>
                    <div className="rounded-lg border border-border p-3 flex items-center justify-between bg-[#19191d]">
                      <div className="flex items-center gap-2">
                        <UsdtIcon />
                        <span className="font-medium">{selectedCurrencyLabel}</span>
                      </div>
                      <button type="button" onClick={() => setAssetSheetOpen(true)}><ChevronDown className="w-5 h-5 text-primary" /></button>
                    </div>
                  </div>

                  {/* Recipient address */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Recipient wallet address</label>
                    <input
                      className="w-full rounded-lg border border-border bg-[#19191d] px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="0x..."
                      value={recipientAddress}
                      onChange={e => setRecipientAddress(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* ── FIAT FORM ── */}
              {mode === "fiat" && (
                <>
                  <div className="rounded-xl border border-border bg-[#19191d]">
                    <div className="flex items-center justify-between px-5 pt-4 pb-2">
                      <span className="text-base font-semibold">Bank account details</span>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                    <div className="px-5 pb-4 space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Bank Name</div>
                        <input className="w-full rounded-lg border border-border bg-[#23242A] px-3 py-2 text-sm text-white focus:outline-none" placeholder="e.g. Access Bank" value={bankName} onChange={e => setBankName(e.target.value)} />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Account Number</div>
                        <input className="w-full rounded-lg border border-border bg-[#23242A] px-3 py-2 text-sm text-white focus:outline-none" placeholder="10-digit NUBAN" maxLength={10} value={accountNumber} onChange={e => setAccountNumber(e.target.value)} />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Bank Code</div>
                        <input className="w-full rounded-lg border border-border bg-[#23242A] px-3 py-2 text-sm text-white focus:outline-none" placeholder="e.g. 044" value={bankCode} onChange={e => setBankCode(e.target.value)} />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Account Name</div>
                        <input className="w-full rounded-lg border border-border bg-[#23242A] px-3 py-2 text-sm text-white focus:outline-none" placeholder="Account holder name" value={accountName} onChange={e => setAccountName(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── AMOUNT (shared) ── */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Enter amount (USDT)</label>
                <div className="rounded-lg border border-border p-3 flex items-center justify-between bg-[#19191d]">
                  <input
                    type="number"
                    min={0}
                    value={amount}
                    onChange={e => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="border-0 bg-transparent px-0 text-lg font-semibold w-32 focus:outline-none text-white"
                    placeholder="0"
                  />
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-muted-foreground">Bal: {balance} USDT</span>
                    <div className="flex items-center gap-2">
                      <UsdtIcon />
                      <span className="font-medium text-white">USDT</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── QUOTE / FEE SUMMARY ── */}
              <div className="rounded-lg border border-border bg-[#19191d] p-4 space-y-2 text-sm min-h-[100px]">
                {quoteLoading ? (
                  <SectionLoader variant="dots" message="Calculating fees…" height={80} />
                ) : quote ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground"><ArrowDownLeft className="w-4 h-4 text-primary" />Amount to receive</span>
                      <span className="text-white font-semibold">
                        {quote.amountToReceive} USDT
                        {quote.nairaAmountToReceive ? ` ≈ ₦${quote.nairaAmountToReceive.toLocaleString()}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground"><Percent className="w-4 h-4 text-primary" />Transaction fee</span>
                      <span className="text-white font-semibold">{quote.transactionFee} USDT</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground"><Network className="w-4 h-4 text-primary" />Estimated network fee</span>
                      <span className="text-white font-semibold">{quote.estimatedNetworkFee} USDT</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4 text-primary" />Expected arrival</span>
                      <span className="text-white font-semibold">
                        {quote.estimatedArrivalMinutes < 60
                          ? `≈${quote.estimatedArrivalMinutes} min`
                          : `≈${Math.round(quote.estimatedArrivalMinutes / 60)}h`}
                      </span>
                    </div>
                    {quote.exchangeRate && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground"><Info className="w-4 h-4 text-primary" />Exchange rate</span>
                        <span className="text-white font-semibold">1 USDT = ₦{quote.exchangeRate.toLocaleString()}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-xs text-center pt-4">Enter an amount to see fee breakdown</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="button"
                disabled={initiating || !amount || Number(amount) <= 0}
                className="w-full bg-[#6c5dd3] text-white text-base font-semibold py-3 rounded-lg disabled:opacity-50"
                onClick={handleInitiate}
              >
                {initiating ? "Sending OTP…" : `Withdraw ${amount || 0} USDT`}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sheets */}
      <SelectBlockchainSheet
        open={blockchainSheetOpen}
        onClose={() => setBlockchainSheetOpen(false)}
        options={[{ label: "Asset Chain", value: "assetchain", icon: <AssetChainIcon /> }]}
        onSelect={val => { setSelectedNetworkId(val); setSelectedNetworkLabel("Asset Chain"); setBlockchainSheetOpen(false); }}
      />
      <SelectAssetSheet
        open={assetSheetOpen}
        onClose={() => setAssetSheetOpen(false)}
        options={[{ label: "USDT", value: "usdt", icon: <UsdtIcon /> }]}
        onSelect={val => { setSelectedCurrencyId(val); setSelectedCurrencyLabel("USDT"); setAssetSheetOpen(false); }}
      />

      {/* No bank account modal */}
      <NoBankAccountModal
        open={mode === "fiat" && !hasBankAccount}
        onClose={() => setMode("crypto")}
        onManage={() => setMode("crypto")}
      />

      {/* OTP modal */}
      <WithdrawalOtpModal
        open={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email="your registered email"
        onVerify={handleConfirm}
        onResend={handleResend}
        loading={otpLoading}
      />
    </div>
  );
}

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
