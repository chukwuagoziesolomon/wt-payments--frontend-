"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionLoader } from "@/components/ui/LoadingAnimator";
import { authFetch } from "@/lib/auth-fetch";
import { useToast } from "@/components/ui/ToastProvider";
import { CheckCircle2, Clock3, XCircle, Loader2, ExternalLink } from "lucide-react";

const API = "/backend";

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("authToken") || localStorage.getItem("token") || "" : "";
}

function tokenHeaders() {
  const token = getToken();
  return { Authorization: `Bearer ${token}` };
}

type Order = {
  id: string;
  reference_id?: string;
  payment_status?: string;
  order_status?: string;
  amount: number;
  currency: string;
  customer?: { email?: string; phone?: string };
  items?: Array<{ name?: string; quantity?: number; price?: number }>;
  delivery_address?: Record<string, any>;
  delivery_state?: string;
  created_at?: string;
  paid_at?: string;
};

function formatCurrency(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount || 0);
}

function StatusBadge({ status, type = "payment" }: { status?: string; type?: "payment" | "order" }) {
  const lower = (status || "").toLowerCase();
  if (type === "order") {
    const icon = lower === "delivered" ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : lower === "cancelled" ? <XCircle className="h-4 w-4 text-red-400" /> : <Clock3 className="h-4 w-4 text-amber-400" />;
    const color = lower === "delivered" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : lower === "cancelled" ? "bg-red-500/15 text-red-400 border-red-500/25" : "bg-amber-500/15 text-amber-400 border-amber-500/25";
    return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${color}`}>{icon}{status}</span>;
  }
  const icon = lower === "payment_confirmed" ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : lower === "failed" ? <XCircle className="h-4 w-4 text-red-400" /> : <Loader2 className="h-4 w-4 text-amber-400" />;
  const color = lower === "payment_confirmed" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : lower === "failed" ? "bg-red-500/15 text-red-400 border-red-500/25" : "bg-amber-500/15 text-amber-400 border-amber-500/25";
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${color}`}>{icon}{status}</span>;
}

export default function OrdersPage() {
  const router = useRouter();
  const { notify } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const token = getToken();
        const res = await authFetch(`${API}/user/payment-intent/history?page=1&limit=50`, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }, cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json.error) {
          throw new Error(json.data || json.message || "Failed to load orders");
        }
        const list = json.result?.transactions ?? json.data?.transactions ?? [];
        const normalized = Array.isArray(list) ? list.map((t: any) => ({
          id: t.transaction_id || t.id || t.reference_id || "-",
          reference_id: t.reference_id,
          payment_status: t.status,
          order_status: t.status,
          amount: Number(t.amount || 0),
          currency: t.currency?.symbol || t.currency || "NGN",
          customer: t.customer,
          items: t.items,
          delivery_address: t.delivery_address,
          delivery_state: t.delivery_state,
          created_at: t.created_at,
          paid_at: t.completed_at || t.paid_at,
        })) : [];
        if (!cancelled) setOrders(normalized);
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load orders.";
          setError(message);
          notify(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [notify]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <SectionLoader message="Loading orders…" variant="bars" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-8 flex items-center justify-center">
        <Card className="bg-[#19191d] border-border max-w-md w-full">
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-sm text-red-400">{error}</p>
            <Button onClick={() => router.back()} className="text-white">Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9d8df1]">History</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Orders</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your past orders and payment status.</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
        </header>

        {orders.length === 0 ? (
          <Card className="bg-[#19191d] border-border">
            <CardContent className="py-16 text-center text-sm text-white/35">No orders yet.</CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id} className="bg-[#19191d] border-border">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium">{order.reference_id || order.id}</p>
                      <p className="text-xs text-white/35">{order.created_at ? new Date(order.created_at).toLocaleString() : "-"}</p>
                      {order.customer?.email && <p className="text-xs text-white/30">{order.customer.email}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-white/70">{formatCurrency(order.amount, order.currency)}</span>
                      <StatusBadge status={order.payment_status} />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/checkout/confirm/${order.reference_id || order.id}`)} className="gap-1 text-xs">
                      <ExternalLink className="h-3.5 w-3.5" /> View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
