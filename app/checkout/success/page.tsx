"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, CheckCircle2, Loader2 } from "lucide-react";

type CheckoutItem = {
  product_id: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  image?: string | null;
  shop_id?: string;
};

type CheckoutSuccessData = {
  payment_intent_id?: string;
  reference_id?: string;
  fiat_amount?: number;
  fiat_currency?: string;
  items_count?: number;
  items_total?: number;
  delivery_fee?: number;
  delivery_fee_currency?: string;
  delivery_fee_local?: number;
  delivery_fee_local_currency?: string;
  discount_amount?: number;
  items?: CheckoutItem[];
  status?: string;
  transaction_hash?: string;
  payment_hash?: string;
  explorer_url?: string | null;
};

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referenceId = searchParams.get("reference_id");
  const [data, setData] = useState<CheckoutSuccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        if (!referenceId) throw new Error("Missing payment reference.");
        const res = await fetch(`/api/payment/status/${encodeURIComponent(referenceId)}`, { cache: "no-store" });

        const json = await res.json().catch(() => ({}));
        if (!res.ok || json.error) {
          throw new Error(json.data || json.message || "Failed to load order details");
        }

        const result = (json.result || json.data || {}) as CheckoutSuccessData & { status?: string; order_status?: string };
        const status = String(result.status || "").toLowerCase();
        if (!["payment_completed", "completed", "payment_confirmed"].includes(status)) {
          router.replace(`/checkout/confirm/${encodeURIComponent(referenceId)}`);
          return;
        }
        if (!cancelled) {
          let summary: CheckoutSuccessData = result;
          try {
            const cached = sessionStorage.getItem(`checkout:${referenceId}`);
            if (cached) summary = { ...(JSON.parse(cached) as CheckoutSuccessData), ...result };
          } catch {
            // The payment status remains authoritative even without cached summary data.
          }
          setData(summary);
          setPaid(true);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Failed to load order details");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [referenceId, router]);

  const formatCurrency = (amount: number, currency = "NGN") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount || 0);

  const items = data?.items || [];
  const subtotal = data?.items_total || 0;
  const deliveryFee = data?.delivery_fee || 0;
  const discount = data?.discount_amount || 0;
  const total = data?.fiat_amount || subtotal + deliveryFee - discount;
  const currency = data?.fiat_currency || items[0]?.currency || "NGN";

  if (!paid) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-8 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Verifying payment...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 flex items-center justify-center">
      <Card className="bg-[#19191d] border-border max-w-2xl w-full">
        <CardContent className="py-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold text-white">Order Confirmed</h2>
            <p className="text-sm text-muted-foreground">
              Payment received. You will receive an email confirmation shortly.
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading order details...
            </div>
          )}

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          {!loading && !error && data && (
            <div className="space-y-4">
              {referenceId && (
                <p className="text-xs text-muted-foreground text-center">
                  Reference: <span className="text-white/80 font-mono">{referenceId}</span>
                </p>
              )}

              {items.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">Order items</h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.product_id} className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/30">
                              <ShoppingBag className="h-4 w-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm text-white truncate">{item.name}</p>
                            <p className="text-xs text-white/40">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="text-sm text-white/80 shrink-0">
                          {formatCurrency(item.price * item.quantity, item.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-white">{formatCurrency(subtotal, currency)}</span>
                </div>
                {(data.transaction_hash || data.payment_hash || data.explorer_url) && (
                  <div className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 text-sm">
                    <p className="font-semibold text-emerald-300">Confirmed payment</p>
                    {data.transaction_hash && <div><span className="text-white/45">Transaction hash</span><p className="break-all font-mono text-xs text-white/80">{data.transaction_hash}</p></div>}
                    {data.payment_hash && <div><span className="text-white/45">Fiber payment hash</span><p className="break-all font-mono text-xs text-white/80">{data.payment_hash}</p></div>}
                    {data.explorer_url && <a href={data.explorer_url} target="_blank" rel="noreferrer" className="inline-block text-emerald-300 underline">View on CKB Explorer</a>}
                  </div>
                )}
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-white">{formatCurrency(deliveryFee, data.delivery_fee_currency || currency)}</span>
                  </div>
                )}
                {data.delivery_fee_local && data.delivery_fee_local !== deliveryFee && (
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Local delivery fee</span>
                    <span>{formatCurrency(data.delivery_fee_local, data.delivery_fee_local_currency || currency)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-400">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount, currency)}</span>
                  </div>
                )}
                <div className="border-t border-white/[0.08] pt-2 flex justify-between font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-white">{formatCurrency(total, currency)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <Button onClick={() => router.push("/")} className="bg-gradient-to-r from-[#9d8df1] to-[#5b4dd4] text-white">
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

