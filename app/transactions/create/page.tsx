"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, Info, ArrowDownLeft, Percent, Network, Clock } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { WaitingForPaymentModal, type PaymentIntentData } from "@/components/WaitingForPaymentModal";
import { SelectBlockchainSheet } from "@/src/components/wallet/SelectBlockchainSheet";
import { SelectAssetSheet } from "@/src/components/wallet/SelectAssetSheet";
import { authFetch } from "@/lib/auth-fetch";
import type { AvailableAsset } from "@/types";

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

function renderNetworkIcon(network: { logo?: string; name: string }) {
  if (network.logo) {
    return <img src={network.logo} alt={network.name} className="w-6 h-6 rounded-full" />;
  }
  return (
    <span className="inline-flex w-6 h-6 bg-[#23242A] rounded-full items-center justify-center text-white text-[9px] font-bold">
      {network.name.slice(0, 2).toUpperCase()}
    </span>
  );
}

function renderAssetIcon(asset: { logo?: string; symbol: string }) {
  if (asset.logo) {
    return <img src={asset.logo} alt={asset.symbol} className="w-6 h-6 rounded-full" />;
  }
  return (
    <span className="inline-flex w-6 h-6 bg-[#23242A] rounded-full items-center justify-center text-white text-[9px] font-bold">
      {asset.symbol.slice(0, 2).toUpperCase()}
    </span>
  );
}

function getEstimatedArrival(networkType?: string): string {
  const type = (networkType || "").toLowerCase();
  if (type === "solana") return "~1 min";
  if (type === "tron") return "~1 min";
  if (type === "ckb") return "~1 min";
  if (type === "evm") return "~5-10 mins";
  return "~1-5 mins";
}

export default function CreateTransactionPage() {
  const router = useRouter();
  const { notify } = useToast();

  const [availableAssets, setAvailableAssets] = React.useState<AvailableAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = React.useState(false);

  const networks = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string; logo?: string; networkType: string; chainKey: string }>();
    for (const asset of availableAssets) {
      if (!asset.network) continue;
      const nid = asset.network.id;
      if (!map.has(nid)) {
        map.set(nid, {
          id: nid,
          name: asset.network.name,
          logo: asset.network.logo,
          networkType: asset.network.networkType,
          chainKey: asset.network.chainKey,
        });
      }
    }
    return Array.from(map.values());
  }, [availableAssets]);

  const [selectedNetworkId, setSelectedNetworkId] = React.useState<string>("");
  const [selectedCurrencyId, setSelectedCurrencyId] = React.useState<string>("");

  const [blockchainSheetOpen, setBlockchainSheetOpen] = React.useState(false);
  const [assetSheetOpen, setAssetSheetOpen] = React.useState(false);

  const selectedNetwork = networks.find(n => n.id === selectedNetworkId) || null;
  const networkAssets = availableAssets.filter(a => a.network && a.network.id === selectedNetworkId);
  const selectedAsset = availableAssets.find(a => a.currency_id === selectedCurrencyId) || null;

  const [fiatAmount, setFiatAmount] = React.useState<number | "">("");
  const [fiatCurrency, setFiatCurrency] = React.useState("NGN");
  const [referenceId, setReferenceId] = React.useState(() => generateReferenceId());
  const [creating, setCreating] = React.useState(false);
  const [step, setStep] = React.useState<1 | 2 | null>(null);

  const [waitingOpen, setWaitingOpen] = React.useState(false);
  const [paymentData, setPaymentData] = React.useState<PaymentIntentData | null>(null);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      setLoadingAssets(true);
      try {
        const res = await authFetch("/backend/available-assets", {
          headers: authHeaders(),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || json?.error) {
          notify(json?.message || "Failed to load available assets");
          return;
        }
        const items: AvailableAsset[] = json?.data || [];
        if (mounted) {
          setAvailableAssets(items);
          if (items.length > 0 && items[0].network) {
            const firstNetwork = items[0].network;
            setSelectedNetworkId(firstNetwork.id);
            setSelectedCurrencyId(items[0].currency_id);
          }
        }
      } catch {
        if (mounted) notify("Failed to load available assets");
      } finally {
        if (mounted) setLoadingAssets(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  React.useEffect(() => {
    if (selectedNetworkId && networkAssets.length > 0 && !networkAssets.find(a => a.currency_id === selectedCurrencyId)) {
      setSelectedCurrencyId(networkAssets[0].currency_id);
    }
  }, [selectedNetworkId, networkAssets, selectedCurrencyId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!referenceId.trim()) { notify("Reference ID is required"); return; }
    if (!fiatAmount || Number(fiatAmount) <= 0) { notify("Enter a valid fiat amount"); return; }
    if (!selectedNetworkId) { notify("Select a blockchain"); return; }
    if (!selectedCurrencyId) { notify("Select a cryptocurrency"); return; }

    setCreating(true);
    try {
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

      setStep(2);
      const walletRes = await authFetch(`${API}/user/payment-intent/create-wallet`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          crypto_currency_id: selectedCurrencyId,
          reference_id: referenceId.trim(),
        }),
      });
      const walletJson = await walletRes.json().catch(() => null);
      if (!walletRes.ok || walletJson?.error) {
        notify(walletJson?.message || "Failed to generate wallet address");
        return;
      }

      const d = walletJson.data;
      const cryptoNetwork: string =
        typeof d.crypto?.network === "object"
          ? (d.crypto.network?.name ?? "")
          : (d.crypto?.network ?? "");
      const selectedAsset = availableAssets.find(a => a.currency_id === selectedCurrencyId);
      setPaymentData({
        payment_intent_id: d.payment_intent_id,
        transaction_id: d.transaction_id,
        expiration_time: d.expiration_time,
        fee_in_crypto: d.fee_in_crypto,
        wallet: d.wallet,
        fiat: d.fiat ?? { amount: Number(fiatAmount), currency: fiatCurrency },
        crypto: {
          ...d.crypto,
          network: cryptoNetwork,
          logo: selectedAsset?.crypto.logo,
          networkType: selectedAsset?.network?.networkType,
        },
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

            {/* Blockchain selector */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Blockchain</label>
              <div
                className="rounded-md border border-border p-4 flex items-center justify-between bg-[#19191d] cursor-pointer"
                onClick={() => setBlockchainSheetOpen(true)}
              >
                <div className="flex items-center gap-2">
                  {selectedNetwork ? renderNetworkIcon(selectedNetwork) : <span className="text-muted-foreground">Select blockchain</span>}
                  <span className="font-medium">{selectedNetwork?.name || "Select blockchain"}</span>
                </div>
                <ChevronDown className="w-5 h-5 text-primary" />
              </div>
            </div>

             {/* Asset selector */}
             <div className="relative">
               <label className="block text-sm text-muted-foreground mb-2">Cryptocurrency</label>
               <div
                 className={`rounded-md border border-border p-4 flex items-center justify-between bg-[#19191d] cursor-pointer ${!selectedNetwork ? "opacity-50" : ""}`}
                 onClick={() => selectedNetwork && setAssetSheetOpen(true)}
               >
                 <div className="flex items-center gap-2">
                   {selectedAsset ? renderAssetIcon(selectedAsset.crypto) : <span className="text-muted-foreground">Select cryptocurrency</span>}
                   <span className="font-medium">{selectedAsset?.crypto.symbol || "Select cryptocurrency"}</span>
                   {selectedAsset && (
                     <span className="text-muted-foreground text-xs">
                       {selectedAsset.crypto.name}
                     </span>
                   )}
                 </div>
                 <ChevronDown className="w-5 h-5 text-primary" />
               </div>
             </div>

             {/* Network info preview */}
             {selectedNetwork && selectedAsset && (
               <div className="rounded-md border border-[#23242A] bg-[#19191d] p-3 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Clock className="w-4 h-4 text-primary" />
                   <span className="text-xs text-muted-foreground">Estimated arrival on {selectedNetwork.name}</span>
                 </div>
                 <span className="text-xs text-white font-semibold">{getEstimatedArrival(selectedAsset?.network?.networkType || selectedNetwork?.networkType)}</span>
               </div>
             )}

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
              disabled={creating || !referenceId.trim() || !fiatAmount || Number(fiatAmount) <= 0 || !selectedNetworkId || !selectedCurrencyId}
              className="w-full bg-[#6c5dd3] text-white text-base font-semibold py-3 rounded-md disabled:opacity-50"
            >
              {creating
                ? step === 1
                  ? "Step 1/2: Creating intent…"
                  : "Step 2/2: Generating address…"
                : selectedAsset
                  ? `Create ${selectedAsset.crypto.symbol} Payment`
                  : "Create Payment"}
            </Button>
          </form>
        </div>
      </div>

      <SelectBlockchainSheet
        open={blockchainSheetOpen}
        onClose={() => setBlockchainSheetOpen(false)}
        options={networks.map(n => ({ label: n.name, value: n.id, icon: renderNetworkIcon(n) }))}
        onSelect={val => {
          setSelectedNetworkId(val);
          setAssetSheetOpen(false);
        }}
      />
      <SelectAssetSheet
        open={assetSheetOpen}
        onClose={() => setAssetSheetOpen(false)}
        options={networkAssets.map(a => ({ label: `${a.crypto.symbol} - ${a.crypto.name}`, value: a.currency_id, icon: renderAssetIcon(a.crypto) }))}
        onSelect={val => {
          setSelectedCurrencyId(val);
          setAssetSheetOpen(false);
        }}
      />

      <WaitingForPaymentModal
        open={waitingOpen}
        onClose={() => setWaitingOpen(false)}
        paymentData={paymentData}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
}
