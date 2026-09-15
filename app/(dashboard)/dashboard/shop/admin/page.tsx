"use client";

import * as React from "react";
import { BarChart3, Boxes, CheckCircle2, Clock3, ExternalLink, Package, RefreshCw, ShoppingBag, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/auth-fetch";

const API = "/backend";

type Metric = { label: string; value: string; detail: string; icon: typeof Boxes };
type Order = {
  id: string;
  reference_id?: string;
  customer?: string;
  customerEmail?: string;
  customerPhone?: string;
  amount?: number;
  currency?: string;
  status?: string;
  created_at?: string;
};
type OrderStatus = { label: string; status: string; icon: typeof Clock3 };

type ShopAdminData = {
  stats: { totalPaymentProcessed?: number; totalPayout?: number; totalWalletBalance?: number };
  orders: Order[];
  revenue: Array<{ label: string; amount: number }>;
  productCount: number;
  analytics?: { total_orders?: number; total_revenue?: number };
};

function tokenHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") || localStorage.getItem("token") || "" : "";
  return { Authorization: `Bearer ${token}` };
}

function formatMoney(value: number, currency = "NGN") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(value || 0);
}

function normalizeOrders(payload: any): Order[] {
  const list = payload?.result?.orders ?? payload?.result?.data ?? payload?.data?.orders ?? payload?.data ?? payload?.orders ?? [];
  return Array.isArray(list) ? list.map((order) => ({
    id: order.id ?? order.order_id ?? order.reference_id ?? "-",
    customer: order.customer?.email ?? order.customer_name ?? order.customer_email ?? order.customer ?? "Customer",
    customerEmail: order.customer?.email ?? order.customer_email,
    customerPhone: order.customer?.phone ?? order.customer_phone,
    reference_id: order.reference_id,
    amount: Number(order.total ?? order.amount ?? order.amount_paid ?? 0),
    currency: order.currency ?? "NGN",
    status: order.order_status ?? order.status ?? "pending",
    created_at: order.created_at ?? order.createdAt,
  })) : [];
}

export default function ShopAdminPage() {
  const router = useRouter();
  const [data, setData] = React.useState<ShopAdminData>({ stats: {}, orders: [], revenue: [], productCount: 0, analytics: {} });
  const [loading, setLoading] = React.useState(true);
  const [ordersAvailable, setOrdersAvailable] = React.useState(true);
  const [analytics, setAnalytics] = React.useState({ total_orders: 0, total_revenue: 0 });
  const [statusFilter, setStatusFilter] = React.useState("all");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const orderQuery = statusFilter === "all" ? "" : `&status=${statusFilter}`;
      const [statsResponse, historyResponse, productsResponse, ordersResponse, analyticsResponse] = await Promise.all([
        authFetch(`${API}/dashboard/stats`, { headers: tokenHeaders() }),
        authFetch(`${API}/user/payment-intent/history`, { headers: tokenHeaders() }),
        authFetch(`${API}/user/shop/products?page=1&limit=1`, { headers: tokenHeaders() }),
        authFetch(`${API}/user/shop/orders?page=1&limit=50${orderQuery}`, { headers: tokenHeaders() }),
        authFetch(`${API}/user/shop/orders/analytics`, { headers: tokenHeaders() }),
      ]);
      const statsJson = await statsResponse.json().catch(() => ({}));
      const historyJson = await historyResponse.json().catch(() => ({}));
      const productsJson = await productsResponse.json().catch(() => ({}));
      const ordersJson = await ordersResponse.json().catch(() => ({}));
      const analyticsJson = await analyticsResponse.json().catch(() => ({}));
      const stats = statsJson.result ?? statsJson.data ?? {};
      const transactions = historyJson.data?.transactions ?? historyJson.result?.transactions ?? [];
      const revenue = Array.isArray(transactions) ? transactions.slice(0, 7).reverse().map((item: any, index: number) => ({ label: item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : `Day ${index + 1}`, amount: Number(item.amount ?? 0) })) : [];
      const productPayload = productsJson.result ?? productsJson.data ?? {};
      const productCount = Number(productPayload.meta?.total ?? productPayload.total ?? 0);
      const analyticsData = analyticsJson.result ?? {};
      setAnalytics({
        total_orders: Number(analyticsData.total_orders ?? 0),
        total_revenue: Number(analyticsData.total_revenue ?? 0),
      });
      setOrdersAvailable(ordersResponse.ok);
      setData({ stats, orders: normalizeOrders(ordersJson), revenue, productCount });
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => { load(); }, [load]);

  const maxRevenue = Math.max(...data.revenue.map((item) => item.amount), 1);
  const metrics: Metric[] = [
    { label: "Revenue processed", value: formatMoney(analytics.total_revenue || Number(data.stats.totalPaymentProcessed ?? 0)), detail: `${analytics.total_orders || 0} confirmed orders`, icon: BarChart3 },
    { label: "Payouts", value: formatMoney(Number(data.stats.totalPayout ?? 0)), detail: "Funds paid out", icon: CheckCircle2 },
    { label: "Products", value: String(data.productCount), detail: "Products in your catalog", icon: Boxes },
    { label: "Pending orders", value: data.orders.filter((order) => ["pending", "processing"].includes(order.status?.toLowerCase() || "")).length.toString(), detail: ordersAvailable ? "Need attention" : "Order API unavailable", icon: Clock3 },
  ];
  const orderStatuses: OrderStatus[] = [
    { label: "Pending", status: "pending", icon: Clock3 },
    { label: "Processing", status: "processing", icon: Boxes },
    { label: "Shipped", status: "shipped", icon: Truck },
    { label: "Delivered", status: "delivered", icon: CheckCircle2 },
  ];

  async function updateOrderStatus(orderId: string, status: string) {
    const response = await authFetch(`${API}/user/shop/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { ...tokenHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.ok) load();
  }

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9d8df1]">Store control center</p><h1 className="mt-2 text-3xl font-semibold text-white">Your shop admin</h1><p className="mt-1 text-sm text-muted-foreground">Manage products, track confirmed sales, and keep orders moving.</p></div>
          <div className="flex gap-2"><button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm text-white/70 hover:text-white"><RefreshCw className="h-4 w-4" /> Refresh</button><button onClick={() => router.push("/dashboard/shop/products")} className="inline-flex items-center gap-2 rounded-xl bg-[#9d8df1] px-4 py-2.5 text-sm font-semibold text-white"><Package className="h-4 w-4" /> Manage products</button></div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, detail, icon: Icon }) => <div key={label} className="rounded-2xl border border-white/[0.08] bg-[#19191d] p-5"><div className="flex items-center justify-between"><span className="text-sm text-white/55">{label}</span><Icon className="h-5 w-5 text-[#9d8df1]" /></div><p className="mt-5 text-2xl font-semibold text-white">{loading ? "..." : value}</p><p className="mt-1 text-xs text-white/35">{detail}</p></div>)}</section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-white/[0.08] bg-[#19191d] p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold text-white">Revenue activity</h2><p className="mt-1 text-xs text-white/35">Latest confirmed payment activity</p></div><BarChart3 className="h-5 w-5 text-[#9d8df1]" /></div><div className="mt-8 flex h-56 items-end gap-2">{data.revenue.length ? data.revenue.map((item) => <div key={`${item.label}-${item.amount}`} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-lg bg-gradient-to-t from-[#5b4dd4] to-[#9d8df1]" style={{ height: `${Math.max(8, (item.amount / maxRevenue) * 100)}%` }} title={formatMoney(item.amount)} /><span className="text-[10px] text-white/35">{item.label}</span></div>) : <p className="self-center text-sm text-white/35">No confirmed revenue activity yet.</p>}</div></div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#19191d] p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold text-white">Order pipeline</h2><p className="mt-1 text-xs text-white/35">Track fulfilment status</p></div><Truck className="h-5 w-5 text-[#9d8df1]" /></div><div className="mt-6 space-y-3">{orderStatuses.map(({ label, status, icon: Icon }) => <div key={status} className="flex items-center justify-between rounded-xl bg-white/[0.035] px-3 py-3"><span className="flex items-center gap-2 text-sm text-white/65"><Icon className="h-4 w-4 text-[#9d8df1]" />{label}</span><span className="text-sm font-semibold text-white">{data.orders.filter((order) => order.status?.toLowerCase() === status).length}</span></div>)}</div>{!ordersAvailable && <p className="mt-4 text-xs leading-5 text-amber-200/70">Order statuses need the merchant orders endpoint from the backend. Payment activity is still available above.</p>}</div>
        </section>

        <section className="rounded-2xl border border-white/[0.08] bg-[#19191d] p-5 sm:p-6"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-white">Recent orders</h2><p className="mt-1 text-xs text-white/35">Customer orders and fulfilment state</p></div><div className="flex items-center gap-3"><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs text-white"><option value="all">All statuses</option><option value="pending">Pending</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select><button onClick={() => router.push("/dashboard/transactions")} className="inline-flex items-center gap-2 text-xs text-[#c7bfff]">View payments <ExternalLink className="h-3.5 w-3.5" /></button></div></div>{data.orders.length ? <div className="divide-y divide-white/[0.06]">{data.orders.slice(0, 8).map((order) => <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="text-sm text-white">{order.customer}</p><p className="text-xs text-white/35">{order.reference_id || order.id} {order.created_at ? `- ${new Date(order.created_at).toLocaleDateString()}` : ""}</p><p className="text-xs text-white/30">{order.customerEmail || ""} {order.customerPhone ? `- ${order.customerPhone}` : ""}</p></div><div className="flex items-center gap-4"><span className="text-sm text-white/70">{formatMoney(order.amount || 0, order.currency)}</span><select value={order.status || "pending"} onChange={(event) => updateOrderStatus(order.id, event.target.value)} className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-xs capitalize text-white"><option value="pending">Pending</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></div></div>)}</div> : <div className="flex flex-col items-center gap-3 py-12 text-center"><ShoppingBag className="h-8 w-8 text-white/20" /><p className="text-sm text-white/45">No order records are available yet.</p></div>}</section>
      </div>
    </main>
  );
}
