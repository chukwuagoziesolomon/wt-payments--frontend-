"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowDownLeft, Percent, Network, Clock, Info, DollarSign, Copy, Shield } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/ToastProvider";
import { WithdrawalOtpModal } from "@/src/components/wallet/WithdrawalOtpModal";
import { SelectBlockchainSheet } from "@/src/components/wallet/SelectBlockchainSheet";
import { SelectAssetSheet } from "@/src/components/wallet/SelectAssetSheet";
import { WaitingForPaymentModal } from "@/components/WaitingForPaymentModal";
import { SectionLoader } from "@/components/ui/LoadingAnimator";
import { useWalletBalance, type WithdrawalUpdateEvent } from "@/hooks/use-wallet-balance";
import { authFetch } from "@/lib/auth-fetch";

const API = "/backend";

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
function CkbIcon() {
  return (
    <span className="inline-flex w-6 h-6 bg-[#3dba9e] rounded-full items-center justify-center text-white text-[10px] font-bold">CKB</span>
  );
}
function EthIcon() {
  return (
    <span className="inline-flex w-6 h-6 bg-[#627eea] rounded-full items-center justify-center text-white text-[10px] font-bold">ETH</span>
  );
}
function MaticIcon() {
  return (
    <span className="inline-flex w-6 h-6 bg-[#8247e5] rounded-full items-center justify-center text-white text-[9px] font-bold">POL</span>
  );
}

type AssetConfig = { id: string; label: string; sudtTypeScript: string | null };
type NetworkConfig = {
  id: string;
  label: string;
  networkType: "ckb" | "evm" | "solana" | "tron";
  icon: React.ReactNode;
  addressPlaceholder: string;
  assets: AssetConfig[];
  disabled?: boolean;
  badge?: string;
};

function SolanaIcon() {
  return <span className="inline-flex w-6 h-6 bg-[#9945ff] rounded-full items-center justify-center text-white text-[9px] font-bold">SOL</span>;
}
function TronIcon() {
  return <span className="inline-flex w-6 h-6 bg-[#ff060a] rounded-full items-center justify-center text-white text-[9px] font-bold">TRX</span>;
}

function isValidAddress(address: string, networkType: string): boolean {
  if (!address) return false;
  if (networkType === "evm") return /^0x[a-fA-F0-9]{40}$/.test(address);
  if (networkType === "ckb") return /^ckt1q[a-zA-Z0-9]{20,40}$/.test(address);
  if (networkType === "solana") return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address) && !address.startsWith("0x");
  if (networkType === "tron") return /^T[a-zA-Z0-9]{33}$/.test(address);
  return true;
}

const NETWORKS: NetworkConfig[] = [
  {
    id: "net_ckb_testnet",
    label: "CKB (Fiber)",
    networkType: "ckb",
    icon: <CkbIcon />,
    addressPlaceholder: "ckt1q...",
    assets: [
      { id: "CKB", label: "CKB", sudtTypeScript: null },
      {
        id: "RUSD",
        label: "RUSD",
        sudtTypeScript:
          '{"code_hash":"0x1142755a044bf2ee358cba9f2da187ce928c91cd4dc8692ded0337efa677d21a","hash_type":"type","args":"0x878fcc6f1f08d48e87bb1c3b3d5083f23f8a39c5d5c764f253b55b998526439b"}',
      },
      {
        id: "FIBB",
        label: "FIBB",
        sudtTypeScript:
          '{"code_hash":"0x50bd8d6680b8b9cf98b73f3c08faf8b2a21914311954118ad6609be6e78a1b95","hash_type":"data1","args":"0x"}',
      },
    ],
  },
  {
    id: "net_ethereum",
    label: "Ethereum",
    networkType: "evm",
    icon: <EthIcon />,
    addressPlaceholder: "0x...",
    assets: [
      { id: "USDT", label: "USDT", sudtTypeScript: null },
      { id: "ETH", label: "ETH", sudtTypeScript: null },
    ],
  },
  {
    id: "net_polygon",
    label: "Polygon",
    networkType: "evm",
    icon: <MaticIcon />,
    addressPlaceholder: "0x...",
    assets: [
      { id: "USDT", label: "USDT", sudtTypeScript: null },
      { id: "MATIC", label: "MATIC", sudtTypeScript: null },
    ],
  },
  {
    id: "net_solana",
    label: "Solana",
    networkType: "solana",
    icon: <SolanaIcon />,
    addressPlaceholder: "7EcjQq5RXkqBaDb2LDWSDbQmybg4GBFPJV2H9DDJr4V",
    assets: [
      { id: "SOL", label: "SOL", sudtTypeScript: null },
      { id: "USDC", label: "USDC", sudtTypeScript: null },
    ],
  },
  {
    id: "net_tron",
    label: "Tron",
    networkType: "tron",
    icon: <TronIcon />,
    addressPlaceholder: "TQcZ9FqK9w8fZ6fQo1J19w6dE6w8fZ6fQo1J19w6dE6",
    assets: [
      { id: "TRX", label: "TRX", sudtTypeScript: null },
      { id: "USDT", label: "USDT", sudtTypeScript: null },
    ],
  },
  {
    id: "net_bitcoin",
    label: "Bitcoin (BB)",
    networkType: "evm",
    icon: <span className="inline-flex w-6 h-6 bg-[#f7931a] rounded-full items-center justify-center text-white text-[9px] font-bold">BTC</span>,
    addressPlaceholder: "",
    assets: [],
    disabled: true,
    badge: "Soon",
  },
];

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
  const [selectedNetwork, setSelectedNetwork] = React.useState<NetworkConfig | null>(null);
  const [selectedAsset, setSelectedAsset] = React.useState<AssetConfig | null>(null);

  // Fiat fields
  // Bank details are now saved in settings, so no form fields needed here

  // Shared
  const [amount, setAmount] = React.useState<number | "">("");
  const [quote, setQuote] = React.useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = React.useState(false);

  // Flow state
  const [initiating, setInitiating] = React.useState(false);
  const [otpId, setOtpId] = React.useState("");
  const [pendingTransactionId, setPendingTransactionId] = React.useState<string | null>(null);
  const [showOtpModal, setShowOtpModal] = React.useState(false);
  const [otpLoading, setOtpLoading] = React.useState(false);

  // Load wallet balance on mount
  React.useEffect(() => {
    authFetch(`${API}/user/wallet/balance`, { headers: authHeaders() })
      .then(r => r.json())
      .catch(() => null)
      .then(json => {
        const list: WalletEntry[] = json?.result?.wallets || json?.wallets || [];
        setWallets(list);
        if (list.length > 0) setSelectedWallet(list[0]);
      });
  }, []);

  // Listen for real-time withdrawal updates
  useWalletBalance({
    onWithdrawalUpdate: (event: WithdrawalUpdateEvent) => {
      if (event.status === "completed") {
        notify(`Withdrawal of ${event.amount} ${event.currency} completed! TX: ${event.tx_hash || event.transaction_id}`);
      }
    },
  });

  // Debounced quote fetch
  React.useEffect(() => {
    if (!amount || Number(amount) <= 0) { setQuote(null); return; }
    setQuoteLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await authFetch(
          `${API}/user/withdrawal/quote?amount=${amount}&type=${mode}`,
          { headers: authHeaders() }
        );
        const json = await res.json().catch(() => null);
        if (json?.status && json?.result) setQuote(json.result);
        else if (json?.result) setQuote(json.result);
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
    if (mode === "crypto" && selectedNetwork && !isValidAddress(recipientAddress, selectedNetwork.networkType)) {
      notify("Invalid recipient address for selected network");
      return;
    }

    setInitiating(true);
    try {
      const body =
        mode === "crypto"
          ? {
              type: "crypto",
              user_wallet_id: selectedWallet.wallet_id,
              crypto_currency_id: selectedAsset?.id ?? "",
              network_id: selectedNetwork?.id ?? "",
              amount: Number(amount),
              recipient_address: recipientAddress,
              ...(selectedAsset?.sudtTypeScript
                ? { sudt_type_script: selectedAsset.sudtTypeScript }
                : {}),
            }
          : {
              type: "fiat",
              user_wallet_id: selectedWallet.wallet_id,
              amount: Number(amount),
            };

      const res = await authFetch(`${API}/user/withdrawal/initiate`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || json?.error) {
        const message = typeof json?.data === "string"
          ? json.data
          : json?.message || "Failed to initiate withdrawal";
        notify(message);

        // If it's a no bank account error, suggest going to settings
        if (typeof message === "string" && message.toLowerCase().includes("no bank account") && mode === "fiat") {
          setTimeout(() => {
            const goToSettings = window.confirm(
              "Would you like to go to Settings to add your bank account?"
            );
            if (goToSettings) {
              router.push("/dashboard/settings?tab=payout");
            }
          }, 1000);
        }
        return;
      }

      setOtpId(json.result?.otp_id ?? json.data?.otp_id ?? "");
      setPendingTransactionId(json.result?.transaction_id ?? json.data?.transaction_id ?? null);
      setShowOtpModal(true);
    } finally {
      setInitiating(false);
    }
  }

  async function handleConfirm(code: string) {
    setOtpLoading(true);
    try {
      const res = await authFetch(`${API}/user/withdrawal/confirm`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ otp_id: otpId, otp_code: code }),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || (json?.error !== false && !json?.result)) {
        notify(json?.data || json?.message || "OTP verification failed");
        return;
      }

      const txId = json.result?.transaction_id ?? json.data?.transaction_id ?? pendingTransactionId;
      const txHash = json.result?.txHash ?? json.data?.txHash;

      setShowOtpModal(false);
      notify(
        txId
          ? `Withdrawal submitted! Transaction ID: ${txId}${txHash ? ` · TX: ${txHash}` : ""}`
          : json.message || "Withdrawal submitted!"
      );
      router.push("/dashboard/transactions");
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
                        {selectedNetwork ? selectedNetwork.icon : <CkbIcon />}
                        <span className="font-medium">{selectedNetwork?.label ?? "Select network"}</span>
                      </div>
                      <button type="button" onClick={() => setBlockchainSheetOpen(true)}><ChevronDown className="w-5 h-5 text-primary" /></button>
                    </div>
                  </div>

                  {/* Asset */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Asset</label>
                    <div
                      className={`rounded-lg border border-border p-3 flex items-center justify-between bg-[#19191d] ${!selectedNetwork ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <UsdtIcon />
                        <span className="font-medium">{selectedAsset?.label ?? "Select asset"}</span>
                      </div>
                      <button
                        type="button"
                        disabled={!selectedNetwork}
                        onClick={() => selectedNetwork && setAssetSheetOpen(true)}
                      >
                        <ChevronDown className="w-5 h-5 text-primary" />
                      </button>
                    </div>
                  </div>

                  {/* Recipient address */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Recipient wallet address</label>
                    <input
                      className="w-full rounded-lg border border-border bg-[#19191d] px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder={selectedNetwork?.addressPlaceholder ?? "0x..."}
                      value={recipientAddress}
                      onChange={e => setRecipientAddress(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* ── FIAT FORM ── */}
              {mode === "fiat" && (
                <>
                  <div className="rounded-xl border border-border bg-[#19191d] p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-semibold text-white">Bank account</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/dashboard/settings?tab=payout")}
                      >
                        Manage
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your saved bank account details will be used for this withdrawal. To change them, update your settings.
                    </p>
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
        options={NETWORKS.map(n => ({ label: n.label, value: n.id, icon: n.icon, disabled: n.disabled, badge: n.badge }))}
        onSelect={val => {
          const net = NETWORKS.find(n => n.id === val);
          if (!net) return;
          setSelectedNetwork(net);
          setSelectedAsset(net.assets[0] ?? null);
          setBlockchainSheetOpen(false);
        }}
      />
      <SelectAssetSheet
        open={assetSheetOpen}
        onClose={() => setAssetSheetOpen(false)}
        options={(selectedNetwork?.assets ?? []).map(a => ({ label: a.label, value: a.id, icon: <UsdtIcon /> }))}
        onSelect={val => {
          const asset = selectedNetwork?.assets.find(a => a.id === val) ?? null;
          setSelectedAsset(asset);
          setAssetSheetOpen(false);
        }}
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
