"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionLoader } from "@/components/ui/LoadingAnimator";
import { authFetch } from "@/lib/auth-fetch";
import { useToast } from "@/components/ui/ToastProvider";
import { Clock, CheckCircle2, XCircle, Loader2, ShoppingBag, Copy, Check } from "lucide-react";
import { WaitingForPaymentModal, type PaymentIntentData } from "@/components/WaitingForPaymentModal";

const API = "/backend";

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("authToken") || localStorage.getItem("token") || "" : "";
}

function tokenHeaders() {
  const token = getToken();
  return { Authorization: `Bearer ${token}` };
}

type TimelineEvent = { event: string; timestamp: string };
type OrderItem = { product_id: string; name: string; price: number; currency: string; quantity: number; image?: string | null; shop_id?: string };
type WalletInfo = { address: string; qr_code?: string; network?: string; currency?: string; amount?: number };
type OrderDetail = {
  payment_intent_id: string;
  reference_id: string;
  status: string;
  order_status?: string;
  fiat_amount: number;
  fiat_currency: string;
  items_total: number;
  delivery_fee: number;
  delivery_fee_currency: string;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  shop_id: string;
  shop_name?: string;
  items: OrderItem[];
  assets?: Array<{ currency_id: string; name: string; symbol: string; logo?: string; network?: { name: string; logo?: string }; amount: number }>;
  delivery_address?: Record<string, any>;
  delivery_state?: string;
  customer?: { email?: string; phone?: string };
  wallet?: WalletInfo;
  timeline?: TimelineEvent[];
  created_at: string;
  paid_at?: string;
  updated_at?: string;
};

function formatCurrency(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount || 0);
}

function StatusBadge({ status }: { status: string }) {
  const lower = status.toLowerCase();
  const icon = lower === "completed" || lower === "payment_confirmed" ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : lower === "failed" || lower === "cancelled" ? <XCircle className="h-4 w-4 text-red-400" /> : <Loader2 className="h-4 w-4 text-amber-400" />;
  const color = lower === "completed" || lower === "payment_confirmed" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : lower === "failed" || lower === "cancelled" ? "bg-red-500/15 text-red-400 border-red-500/25" : "bg-amber-500/15 text-amber-400 border-amber-500/25";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${color}`}>
      {icon}
      {status}
    </span>
  );
}

export default function CheckoutConfirmPage() {
  const params = useParams();
  const referenceId = params.referenceId as string;
  const router = useRouter();
  const { notify } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [order, setOrder] = React.useState<OrderDetail | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState<any>(null);
  const [paymentData, setPaymentData] = React.useState<PaymentIntentData | null>(null);
  const [waitingOpen, setWaitingOpen] = React.useState(false);
  const [creatingWallet, setCreatingWallet] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const token = getToken();
        const res = await authFetch(`${API}/user/checkout/${encodeURIComponent(referenceId)}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          cache: "no-store",
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json.error) {
          throw new Error(json.data || json.message || "Failed to load order details");
        }
        const data = (json.result || json.data || {}) as OrderDetail;
        if (!cancelled) {
          setOrder(data);
          if (data.assets?.length && data.payment_method === "crypto") {
            setSelectedAsset(data.assets[0]);
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load order details.";
          setError(message);
          notify(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (referenceId) load();
    return () => { cancelled = true; };
  }, [referenceId, notify]);

  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    notify("Address copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCreateWallet = async () => {
    if (!order || !selectedAsset) return;
    setCreatingWallet(true);
    try {
      const token = getToken();
      const guestToken = typeof window !== "undefined" ? localStorage.getItem("guest_cart_token") || localStorage.getItem("guest_token") : null;
      const walletUrl = token ? `/api/user/cart/wallet` : `/api/cart/wallet`;
      const body: any = { crypto_currency_id: selectedAsset.currency_id };
      if (token) {
        body.payment_intent_id = order.payment_intent_id;
      } else {
        body.reference_id = order.reference_id;
      }

      const res = await fetch(walletUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      const data = json.data || json.result;
      if (!res.ok || !data?.wallet) {
        throw new Error(json.data || json.message || "Unable to create payment wallet");
      }
      const cryptoNetwork = typeof data.crypto?.network === "object" ? data.crypto.network?.name ?? "" : data.crypto?.network ?? "";
      setPaymentData({
        payment_intent_id: data.payment_intent_id || order.payment_intent_id,
        transaction_id: data.transaction_id,
        expiration_time: data.expiration_time,
        fee_in_crypto: Number(data.fee_in_crypto || 0),
        wallet: data.wallet,
        fiat: data.fiat || { amount: order.fiat_amount || order.total_amount || 0, currency: order.fiat_currency || "NGN" },
        crypto: { ...data.crypto, network: cryptoNetwork, symbol: data.crypto?.symbol || selectedAsset?.symbol || "", amount: Number(data.crypto?.amount || selectedAsset?.amount || 0) },
      });
      setWaitingOpen(true);
    } catch (err: any) {
      notify(err.message || "Unable to create payment wallet");
    } finally {
      setCreatingWallet(false);
    }
  };

  const handlePaymentComplete = () => {
    setWaitingOpen(false);
    notify("Payment received!");
    router.push("/orders");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <SectionLoader message="Loading order details…" variant="bars" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-8 flex items-center justify-center">
        <Card className="bg-[#19191d] border-border max-w-md w-full">
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-sm text-red-400">{error || "Order not found"}</p>
            <Button onClick={() => router.push("/")} className="text-white">Continue Shopping</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const total = order.total_amount || order.fiat_amount || order.items_total + order.delivery_fee;
  const currency = order.fiat_currency || "NGN";

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9d8df1]">Checkout</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Order Confirmation</h1>
            <p className="mt-1 text-sm text-muted-foreground">Reference: {order.reference_id}</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/orders")}>View Orders</Button>
        </header>

        <div className="grid gap-4">
          <Card className="bg-[#19191d] border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-white">Status</CardTitle>
                <StatusBadge status={order.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span className="text-white">{new Date(order.created_at).toLocaleString()}</span></div>
              {order.paid_at && <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span className="text-white">{new Date(order.paid_at).toLocaleString()}</span></div>}
              {order.customer?.email && <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="text-white">{order.customer.email}</span></div>}
              {order.customer?.phone && <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="text-white">{order.customer.phone}</span></div>}
            </CardContent>
          </Card>

          <Card className="bg-[#19191d] border-border">
            <CardHeader><CardTitle className="text-base font-semibold text-white">Items</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/30"><ShoppingBag className="h-4 w-4" /></div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{item.name}</p>
                      <p className="text-xs text-white/40">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-sm text-white/80 shrink-0">{formatCurrency(item.price * item.quantity, item.currency)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-[#19191d] border-border">
            <CardHeader><CardTitle className="text-base font-semibold text-white">Payment</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="text-white capitalize">{order.payment_method}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-white">{formatCurrency(order.items_total, currency)}</span></div>
              {order.delivery_fee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="text-white">{formatCurrency(order.delivery_fee, order.delivery_fee_currency || currency)}</span></div>}
              {order.discount_amount > 0 && <div className="flex justify-between text-emerald-400"><span>Discount</span><span>-{formatCurrency(order.discount_amount, currency)}</span></div>}
              <div className="border-t border-white/[0.08] pt-2 flex justify-between font-semibold"><span className="text-white">Total</span><span className="text-white">{formatCurrency(total, currency)}</span></div>
            </CardContent>
          </Card>

          {order.payment_method === "crypto" && !order.wallet && order.assets && order.assets.length > 0 && (
            <Card className="bg-[#19191d] border-border">
              <CardHeader><CardTitle className="text-base font-semibold text-white">Pay with Crypto</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  {order.assets.map((asset) => (
                    <button key={asset.currency_id} type="button" onClick={() => setSelectedAsset(asset)} className={`rounded-lg border p-3 text-left ${selectedAsset?.currency_id === asset.currency_id ? "border-[#9d8df1] bg-[#9d8df1]/10" : "border-white/[0.08]"}`}>
                      <span className="block text-sm font-semibold text-white">{asset.symbol}</span>
                      <span className="block text-xs text-white/50">{asset.network?.name || asset.name} · {asset.amount}</span>
                    </button>
                  ))}
                </div>
                <Button onClick={handleCreateWallet} disabled={creatingWallet || !selectedAsset} className="w-full text-white font-semibold py-2.5 rounded-xl disabled:opacity-50" style={{ backgroundColor: "#9d8df1" }}>
                  {creatingWallet ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating wallet...</> : `Pay with ${selectedAsset?.symbol || "crypto"}`}
                </Button>
              </CardContent>
            </Card>
          )}

          {order.wallet && order.payment_method === "crypto" && (
            <Card className="bg-[#19191d] border-border">
              <CardHeader><CardTitle className="text-base font-semibold text-white">Deposit Wallet</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Network</span>
                  <span className="text-white">{order.wallet.network || "-"}</span>
                </div>
                <div>
                  <span className="text-xs text-white/40">Address</span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 rounded-lg bg-white/[0.04] px-3 py-2 text-xs text-white/80 break-all">{order.wallet.address}</code>
                    <Button variant="outline" size="sm" onClick={() => copyAddress(order.wallet!.address)} className="shrink-0">
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
                {order.wallet.qr_code && <img src={order.wallet.qr_code} alt="QR" className="w-32 h-32 rounded-xl border border-white/[0.08]" />}
              </CardContent>
            </Card>
          )}

          {order.timeline && order.timeline.length > 0 && (
            <Card className="bg-[#19191d] border-border">
              <CardHeader><CardTitle className="text-base font-semibold text-white">Timeline</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {order.timeline.map((evt, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-[#9d8df1]" />
                    <span className="text-white/80 capitalize">{evt.event.replace(/_/g, " ")}</span>
                    <span className="text-xs text-white/40">{new Date(evt.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-center">
          <Button onClick={() => router.push("/")} className="bg-gradient-to-r from-[#9d8df1] to-[#5b4dd4] text-white">Continue Shopping</Button>
        </div>
      </div>

      <WaitingForPaymentModal
        open={waitingOpen}
        onClose={() => setWaitingOpen(false)}
        paymentData={paymentData}
        onPaymentComplete={handlePaymentComplete}
      />
    </main>
  );
}
