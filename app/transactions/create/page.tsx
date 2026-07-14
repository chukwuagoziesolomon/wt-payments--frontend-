"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, Info, ArrowDownLeft, Percent, Network, Clock } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { WaitingForPaymentModal, type PaymentIntentData } from "@/components/WaitingForPaymentModal";
import { authFetch } from "@/lib/auth-fetch";

const API = "/backend";

function getToken() {
  return localStorage.getItem("authToken") || localStorage.getItem("token") || "";
}

function authHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };
}

function generateReferenceId() {
  return `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const ASSETS = [
  { label: "CKB", value: "CKB", icon: "/images/ckb.png" },
  { label: "RUSD", value: "RUSD", icon: "/images/rusd.png" },
];

const ASSET_ICON_MAP: Record<string, string> = {
  CKB: "/images/ckb.png",
  RUSD: "/images/rusd.png",
};

export default function CreateTransactionPage() {
  const router = useRouter();
  const { notify } = useToast();

  const [asset, setAsset] = React.useState<string>("CKB");
  const [assetDropdownOpen, setAssetDropdownOpen] = React.useState(false);
  const [availableAssets, setAvailableAssets] = React.useState<Array<{ symbol: string; name: string; amount: number }>>([]);
  const [fiatAmount, setFiatAmount] = React.useState<number | "">("");
  const [fiatCurrency, setFiatCurrency] = React.useState("NGN");
  const [referenceId, setReferenceId] = React.useState(() => generateReferenceId());
  const [creating, setCreating] = React.useState(false);
  const [step, setStep] = React.useState<1 | 2 | null>(null);

  const [waitingOpen, setWaitingOpen] = React.useState(false);
  const [paymentData, setPaymentData] = React.useState<PaymentIntentData | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!referenceId.trim()) { notify("Reference ID is required"); return; }
    if (!fiatAmount || Number(fiatAmount) <= 0) { notify("Enter a valid fiat amount"); return; }

    setCreating(true);
    try {
      // ── Step 1: Create payment intent ──────────────────────────────
      setStep(1);
      const intentRes = await authFetch(`${API}/user/payment-intent`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          fiat_amount: Number(fiatAmount),
          fiat_currency: fiatCurrency,
          reference_id: referenceId.trim(),
        }),
      });
      const intentJson = await intentRes.json().catch(() => null);
      if (!intentRes.ok || intentJson?.error) {
        notify(intentJson?.message || "Failed to create payment intent");
        return;
      }

      // Populate asset list from response if available
      const assetsFromServer: Array<{ symbol: string; name: string; amount: number }> =
        (intentJson.data?.assets ?? []).map((a: { symbol: string; name: string; amount: number }) => ({
          symbol: a.symbol,
          name: a.name,
          amount: a.amount,
        }));
      const chosenAsset =
        assetsFromServer.length > 0 ? assetsFromServer[0].symbol : asset;
      if (assetsFromServer.length > 0) {
        setAvailableAssets(assetsFromServer);
        setAsset(chosenAsset);
      }

      // ── Step 2: Generate wallet address ────────────────────────────
      setStep(2);
      const walletRes = await authFetch(`${API}/user/payment-intent/create-wallet`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          crypto_currency_id: chosenAsset,
          reference_id: referenceId.trim(),
        }),
      });
      const walletJson = await walletRes.json().catch(() => null);
      if (!walletRes.ok || walletJson?.error) {
        notify(walletJson?.message || "Failed to generate wallet address");
        return;
      }

      const d = walletJson.data;
      // Normalize crypto.network — API may return an object { name, logo } or a plain string
      const cryptoNetwork: string =
        typeof d.crypto?.network === "object"
          ? (d.crypto.network?.name ?? "")
          : (d.crypto?.network ?? "");
      setPaymentData({
        payment_intent_id: d.payment_intent_id,
        transaction_id: d.transaction_id,
        expiration_time: d.expiration_time,
        fee_in_crypto: d.fee_in_crypto,
        wallet: d.wallet,
        fiat: d.fiat ?? { amount: Number(fiatAmount), currency: fiatCurrency },
        crypto: { ...d.crypto, network: cryptoNetwork },
      });
      setWaitingOpen(true);
    } finally {
      setCreating(false);
      setStep(null);
    }
  }

  function handlePaymentComplete() {
    setWaitingOpen(false);
    notify("Payment received!");
    router.push("/transactions/confirmed");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="border-2 border-blue-600 rounded-lg p-0 shadow-xl" style={{ boxShadow: "0 0 0 1.5px #4f4f8f" }}>
          <div className="px-0 pt-0">
            <div className="text-center text-lg font-semibold py-6 border-b border-[#23243a] tracking-wide">Create Transaction</div>
          </div>

          <form onSubmit={handleSubmit} className="bg-[#17171a] px-8 py-8 space-y-6 rounded-b-lg">

            {/* Fiat amount */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Amount ({fiatCurrency})</label>
              <div className="rounded-md border border-border bg-[#19191d] flex items-center px-4 py-3">
                <span className="text-muted-foreground mr-2">$</span>
                <input
                  type="number"
                  min={0.01}
                  step="0.01"
                  value={fiatAmount}
                  onChange={e => setFiatAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  className="flex-1 bg-transparent text-white text-lg font-semibold focus:outline-none"
                  placeholder="100.00"
                  required
                />
                <select
                  value={fiatCurrency}
                  onChange={e => setFiatCurrency(e.target.value)}
                  className="bg-transparent text-muted-foreground text-sm ml-2 focus:outline-none cursor-pointer"
                >
                  <option value="NGN">NGN</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            {/* Blockchain — fixed to Fiber Network */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Blockchain</label>
              <div className="rounded-md border border-border p-4 flex items-center gap-2 bg-[#19191d]">
                <img
                  src="/images/ckb.png"
                  alt="CKB Fiber"
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    const fallbacks = ["/images/ckb.png", "/images/usdtasset.png", "/images/usdcbase.png"]
                    const current = fallbacks.findIndex(f => target.src.includes(f))
                    if (current >= 0 && current < fallbacks.length - 1) {
                      target.src = fallbacks[current + 1]
                    } else {
                      target.style.display = "none"
                    }
                  }}
                />
                <span className="font-medium">Fiber Network (CKB)</span>
              </div>
            </div>

            {/* Asset selector */}
            <div className="relative">
              <label className="block text-sm text-muted-foreground mb-2">Cryptocurrency</label>
              <div
                className="rounded-md border border-border p-4 flex items-center justify-between bg-[#19191d] cursor-pointer"
                onClick={() => setAssetDropdownOpen(o => !o)}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={ASSET_ICON_MAP[asset.toUpperCase()] || "/images/usdcbase.png"}
                    alt={asset}
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      const fallbacks = ["/images/ckb.png", "/images/usdtasset.png", "/images/usdcbase.png"]
                      const current = fallbacks.findIndex(f => target.src.includes(f))
                      if (current >= 0 && current < fallbacks.length - 1) {
                        target.src = fallbacks[current + 1]
                      } else {
                        target.style.display = "none"
                      }
                    }}
                  />
                  <span className="font-medium">{asset}</span>
                  {availableAssets.find(a => a.symbol === asset) && (
                    <span className="text-muted-foreground text-xs">
                      ≈ {availableAssets.find(a => a.symbol === asset)!.amount.toLocaleString()} {asset}
                    </span>
                  )}
                </div>
                <ChevronDown className="w-5 h-5 text-primary" />
              </div>
              {assetDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 rounded-md border border-border bg-[#19191d] shadow-lg">
                  {(availableAssets.length > 0
                    ? availableAssets.map(a => ({ label: a.name || a.symbol, value: a.symbol, sub: `${a.amount.toLocaleString()} ${a.symbol}`, icon: ASSET_ICON_MAP[a.symbol.toUpperCase()] || "/images/usdcbase.png" }))
                    : ASSETS.map(a => ({ label: a.label, value: a.value, sub: "", icon: a.icon }))
                  ).map(a => (
                    <button
                      key={a.value}
                      type="button"
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[#23243a] transition-colors text-left"
                      onClick={() => { setAsset(a.value); setAssetDropdownOpen(false); }}
                    >
                      <img
                        src={a.icon}
                        alt={a.label}
                        className="w-5 h-5 rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          const fallbacks = ["/images/ckb.png", "/images/usdtasset.png", "/images/usdcbase.png"]
                          const current = fallbacks.findIndex(f => target.src.includes(f))
                          if (current >= 0 && current < fallbacks.length - 1) {
                            target.src = fallbacks[current + 1]
                          } else {
                            target.style.display = "none"
                          }
                        }}
                      />
                      <span className="text-white font-medium flex-1">{a.label}</span>
                      {a.sub && <span className="text-muted-foreground text-xs">{a.sub}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reference ID */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Reference / Order ID</label>
              <div className="rounded-md border border-border bg-[#19191d] flex items-center">
                <input
                  type="text"
                  value={referenceId}
                  onChange={e => setReferenceId(e.target.value)}
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-white focus:outline-none"
                  placeholder="e.g. order_abc123"
                  required
                />
                <button
                  type="button"
                  className="px-3 text-xs text-primary hover:text-white border-l border-border py-3"
                  onClick={() => setReferenceId(generateReferenceId())}
                >
                  Generate
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Used to track this payment in your records.</p>
            </div>

            {/* Info box */}
            <div className="rounded-md border border-yellow-700 bg-yellow-900/20 p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <span className="text-yellow-200 text-sm">
                The exact crypto amount will be calculated by the server based on current rates.
                You will see the amount to send after creating the payment.
              </span>
            </div>

            <Button
              type="submit"
              disabled={creating || !referenceId.trim() || !fiatAmount || Number(fiatAmount) <= 0}
              className="w-full bg-[#6c5dd3] text-white text-base font-semibold py-3 rounded-md disabled:opacity-50"
            >
              {creating
                ? step === 1
                  ? "Step 1/2: Creating intent…"
                  : "Step 2/2: Generating address…"
                : `Create ${asset} Payment`}
            </Button>
          </form>
        </div>
      </div>

      <WaitingForPaymentModal
        open={waitingOpen}
        onClose={() => setWaitingOpen(false)}
        paymentData={paymentData}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
}
