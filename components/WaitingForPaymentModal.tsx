import * as React from "react";
import { Copy, Check, Network } from "lucide-react";

export type PaymentIntentData = {
  payment_intent_id: string;
  transaction_id?: string;
  expiration_time: string;
  fee_in_crypto: number;
  wallet: {
    address: string;
    qr_code: string;
  };
  fiat: {
    amount: number;
    currency: string;
  };
  crypto: {
    symbol: string;
    network: string;
    amount: number;
    logo?: string;
    networkType?: string;
  };
};

interface WaitingForPaymentModalProps {
  open: boolean;
  onClose: () => void;
  paymentData?: PaymentIntentData | null;
  onPaymentComplete?: () => void;
}

function getStoredToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("authToken") || localStorage.getItem("token") || "";
}

function useCountdown(expirationTime: string | undefined) {
  const [secondsLeft, setSecondsLeft] = React.useState(0);

  React.useEffect(() => {
    if (!expirationTime) return;

    const calc = () => {
      const diff = Math.max(0, Math.floor((new Date(expirationTime).getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
      return diff;
    };

    calc();
    const interval = setInterval(() => {
      if (calc() === 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [expirationTime]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  return { secondsLeft, display: `${mins}:${secs.toString().padStart(2, "0")}` };
}

function getEstimatedArrival(networkType?: string): string {
  const type = (networkType || "").toLowerCase();
  if (type === "solana") return "~1 min";
  if (type === "tron") return "~1 min";
  if (type === "ckb") return "~1 min";
  if (type === "evm") return "~5-10 mins";
  return "~1-5 mins";
}

function renderNetworkBadge(networkName: string, networkType?: string) {
  const type = (networkType || "").toLowerCase();
  let bg = "bg-[#23242A]";
  let text = "text-white/70";
  if (type === "solana") { bg = "bg-[#9945ff]/20"; text = "text-[#9945ff]"; }
  if (type === "tron") { bg = "bg-[#ff060a]/20"; text = "text-[#ff060a]"; }
  if (type === "ckb") { bg = "bg-[#3dba9e]/20"; text = "text-[#3dba9e]"; }
  if (type === "evm") { bg = "bg-[#627eea]/20"; text = "text-[#627eea]"; }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${bg} ${text} border-white/[0.06]`}>
      <Network className="w-3 h-3" />
      {networkName}
    </span>
  );
}

export const WaitingForPaymentModal: React.FC<WaitingForPaymentModalProps> = ({
  open,
  onClose,
  paymentData,
  onPaymentComplete,
}) => {
  const [copied, setCopied] = React.useState(false);
  const { display: countdown, secondsLeft } = useCountdown(paymentData?.expiration_time);

  // SSE listener for payment.completed
  React.useEffect(() => {
    if (!open || !paymentData) return;

    const token = getStoredToken();
    const es = new EventSource(`/backend/payments/stream?token=${encodeURIComponent(token)}`);

    const handler = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        const matchById =
          (paymentData.transaction_id && data.transaction_id === paymentData.transaction_id) ||
          data.payment_id === paymentData.payment_intent_id;
        if (matchById) {
          es.close();
          onPaymentComplete?.();
        }
      } catch {
        // ignore malformed event
      }
    };

    es.addEventListener("payment.completed", handler);

    return () => {
      es.removeEventListener("payment.completed", handler);
      es.close();
    };
  }, [open, paymentData, onPaymentComplete]);

  function handleCopy() {
    if (!paymentData?.wallet.address) return;
    navigator.clipboard.writeText(paymentData.wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!open) return null;

  // Legacy spinner view (no payment data)
  if (!paymentData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-[#232228] rounded-2xl shadow-2xl px-10 py-12 w-full max-w-xl flex flex-col items-center relative">
          <div className="text-white text-center text-lg font-medium mb-8">
            {`We're waiting to receive your crypto payment.`}<br />
            <span className="text-base font-normal">This can take up to a minute</span>
          </div>
          <div className="flex items-center w-full justify-center gap-8">
            <span className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400/20">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#FFD600"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke="#232228" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <div className="flex-1 h-2 rounded bg-[#393943] mt-2" />
            <span className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-dashed border-yellow-400 animate-spin-slow">
              <span className="w-8 h-8 rounded-full border-2 border-dashed border-yellow-400 opacity-60"></span>
            </span>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white text-xl">x</button>
        </div>
      </div>
    );
  }

  const isExpired = secondsLeft === 0;
  const estimatedArrival = getEstimatedArrival(paymentData.crypto.networkType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 overflow-y-auto py-4">
      <div className="bg-[#17171a] border border-[#2a2a3a] rounded-2xl shadow-2xl w-full max-w-md mx-4 flex flex-col items-center relative p-6 gap-5">

        <div className="w-full flex items-center justify-between">
          <span className="text-white text-base font-semibold">Complete Payment</span>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-mono font-bold ${isExpired ? "text-red-400" : "text-yellow-400"}`}>
              {isExpired ? "Expired" : countdown}
            </span>
            <button onClick={onClose} className="text-white/50 hover:text-white text-xl leading-none">x</button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 w-44 h-44 flex items-center justify-center">
          {paymentData.wallet.qr_code ? (
            <img src={paymentData.wallet.qr_code} alt="Payment QR code" className="w-full h-full object-contain" />
          ) : (
            <span className="text-gray-400 text-xs text-center">QR unavailable</span>
          )}
        </div>

        <div className="w-full bg-[#1e1e2a] border border-[#6c5dd3]/40 rounded-lg px-4 py-3 text-center">
          <p className="text-muted-foreground text-xs mb-1">Send exactly</p>
          <div className="flex items-center justify-center gap-2">
            {paymentData.crypto.logo && (
              <img src={paymentData.crypto.logo} alt={paymentData.crypto.symbol} className="w-5 h-5 rounded-full" />
            )}
            <p className="text-white text-2xl font-bold tracking-tight">
              {paymentData.crypto.amount} {paymentData.crypto.symbol}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 mt-1">
            {renderNetworkBadge(paymentData.crypto.network, paymentData.crypto.networkType)}
          </div>
        </div>

        <div className="w-full">
          <p className="text-muted-foreground text-xs mb-1">To this address</p>
          <div className="flex items-center gap-2 bg-[#19191d] border border-border rounded-lg px-3 py-2">
            <span className="text-white text-xs font-mono flex-1 truncate">{paymentData.wallet.address}</span>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 text-primary hover:text-white transition-colors"
              title="Copy address"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="w-full flex items-center justify-between bg-[#19191d] rounded-lg px-4 py-2 border border-border">
          <span className="text-muted-foreground text-xs">Estimated arrival</span>
          <span className="text-white text-xs font-semibold">{estimatedArrival}</span>
        </div>

        <p className="text-muted-foreground text-xs">
          Approx {paymentData.fiat.currency} {paymentData.fiat.amount.toLocaleString()} fiat value
        </p>

        {/* Transaction ID */}
        {paymentData.transaction_id && (
          <div className="w-full bg-[#19191d] border border-border rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-muted-foreground text-xs">Transaction ID</span>
            <span className="text-white text-xs font-mono">{paymentData.transaction_id}</span>
          </div>
        )}

        <div className="w-full flex items-center justify-center gap-3 bg-[#19191d] rounded-lg py-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-yellow-400/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#FFD600"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke="#232228" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <span className="text-white/70 text-sm">Waiting for payment...</span>
          <span className="w-4 h-4 rounded-full border-2 border-t-transparent border-yellow-400 animate-spin" />
        </div>

        <p className="text-muted-foreground text-xs text-center">
          Payment settles instantly via {paymentData.crypto.network}. Do not close this window.
        </p>
      </div>
    </div>
  );
};
