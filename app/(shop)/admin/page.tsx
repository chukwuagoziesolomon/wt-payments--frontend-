"use client";

import * as React from "react";
import { BarChart3, Boxes, CheckCircle2, Clock3, ExternalLink, Package, RefreshCw, Send, ShoppingBag, Truck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/auth-fetch";
import { useToast } from "@/components/ui/ToastProvider";

const API = "/backend";

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
  const { notify } = useToast();
  const [data, setData] = React.useState<ShopAdminData>({ stats: {}, orders: [], revenue: [], productCount: 0, analytics: {} });
  const [loading, setLoading] = React.useState(true);
  const [ordersAvailable, setOrdersAvailable] = React.useState(true);
  const [analytics, setAnalytics] = React.useState({ total_orders: 0, total_revenue: 0 });
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [orderDetailOpen, setOrderDetailOpen] = React.useState(false);
  const [orderDetailLoading, setOrderDetailLoading] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [orderItems, setOrderItems] = React.useState<any[]>([]);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [messageInput, setMessageInput] = React.useState("");
  const [sendingMessage, setSendingMessage] = React.useState(false);

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
  const metrics = [
    { label: "Revenue processed", value: formatMoney(analytics.total_revenue || Number(data.stats.totalPaymentProcessed ?? 0)), detail: `${analytics.total_orders || 0} confirmed orders`, icon: BarChart3 },
    { label: "Payouts", value: formatMoney(Number(data.stats.totalPayout ?? 0)), detail: "Funds paid out", icon: CheckCircle2 },
    { label: "Products", value: String(data.productCount), detail: "Products in your catalog", icon: Boxes },
    { label: "Pending orders", value: data.orders.filter((order) => ["pending", "processing"].includes(order.status?.toLowerCase() || "")).length.toString(), detail: ordersAvailable ? "Need attention" : "Order API unavailable", icon: Clock3 },
  ];
  const orderStatuses = [
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

  const openOrderDetail = async (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailOpen(true);
    setOrderDetailLoading(true);
    setMessages([]);
    setOrderItems([]);
    try {
      const [detailRes, messagesRes] = await Promise.all([
        authFetch(`${API}/user/shop/orders/${order.id}`, { headers: tokenHeaders() }),
        authFetch(`${API}/user/shop/orders/${order.id}/messages?shop_id=${order.id}`, { headers: tokenHeaders() }),
      ]);
      const detailJson = await detailRes.json().catch(() => ({}));
      const messagesJson = await messagesRes.json().catch(() => ({}));
      if (detailRes.ok) {
        setOrderItems(detailJson.result?.items || detailJson.data?.items || []);
      }
      if (messagesRes.ok) {
        setMessages(messagesJson.result?.messages || messagesJson.data?.messages || []);
      }
    } catch {
      notify("Failed to load order details");
    } finally {
      setOrderDetailLoading(false);
    }
  };

  const sendOrderMessage = async () => {
    if (!selectedOrder || !messageInput.trim()) return;
    setSendingMessage(true);
    try {
      const res = await authFetch(`${API}/user/shop/orders/${selectedOrder.id}/messages?shop_id=${selectedOrder.id}`, {
        method: "POST",
        headers: { ...tokenHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageInput.trim(), sender_type: "merchant" }),
      });
      if (res.ok) {
        setMessageInput("");
        const json = await res.json().catch(() => ({}));
        setMessages((prev) => [...prev, json.result || json.data || { message: messageInput.trim(), sender_type: "merchant", created_at: new Date().toISOString() }]);
      } else {
        notify("Failed to send message");
      }
    } catch {
      notify("Error sending message");
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9d8df1]">Store control center</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Your shop admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage products, track confirmed sales, and keep orders moving.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm text-white/70 hover:text-white"><RefreshCw className="h-4 w-4" /> Refresh</button>
            <button onClick={() => router.push("/shop/products")} className="inline-flex items-center gap-2 rounded-xl bg-[#9d8df1] px-4 py-2.5 text-sm font-semibold text-white"><Package className="h-4 w-4" /> Manage products</button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, detail, icon: Icon }) => <div key={label} className="rounded-2xl border border-white/[0.08] bg-[#19191d] p-5"><div className="flex items-center justify-between"><span className="text-sm text-white/55">{label}</span><Icon className="h-5 w-5 text-[#9d8df1]" /></div><p className="mt-5 text-2xl font-semibold text-white">{loading ? "..." : value}</p><p className="mt-1 text-xs text-white/35">{detail}</p></div>)}</section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-white/[0.08] bg-[#19191d] p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold text-white">Revenue activity</h2><p className="mt-1 text-xs text-white/35">Latest confirmed payment activity</p></div><BarChart3 className="h-5 w-5 text-[#9d8df1]" /></div><div className="mt-8 flex h-56 items-end gap-2">{data.revenue.length ? data.revenue.map((item) => <div key={`${item.label}-${item.amount}`} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-lg bg-gradient-to-t from-[#5b4dd4] to-[#9d8df1]" style={{ height: `${Math.max(8, (item.amount / maxRevenue) * 100)}%` }} title={formatMoney(item.amount)} /><span className="text-[10px] text-white/35">{item.label}</span></div>) : <p className="self-center text-sm text-white/35">No confirmed revenue activity yet.</p>}</div></div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#19191d] p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold text-white">Order pipeline</h2><p className="mt-1 text-xs text-white/35">Track fulfilment status</p></div><Truck className="h-5 w-5 text-[#9d8df1]" /></div><div className="mt-6 space-y-3">{orderStatuses.map(({ label, status, icon: Icon }) => <div key={status} className="flex items-center justify-between rounded-xl bg-white/[0.035] px-3 py-3"><span className="flex items-center gap-2 text-sm text-white/65"><Icon className="h-4 w-4 text-[#9d8df1]" />{label}</span><span className="text-sm font-semibold text-white">{data.orders.filter((order) => order.status?.toLowerCase() === status).length}</span></div>)}</div>{!ordersAvailable && <p className="mt-4 text-xs leading-5 text-amber-200/70">Order statuses need the merchant orders endpoint from the backend. Payment activity is still available above.</p>}</div>
        </section>

        <section className="rounded-2xl border border-white/[0.08] bg-[#19191d] p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-white">Recent orders</h2>
              <p className="mt-1 text-xs text-white/35">Customer orders and fulfilment state</p>
            </div>
            <div className="flex items-center gap-3">
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs text-white">
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button onClick={() => router.push("/dashboard/transactions")} className="inline-flex items-center gap-2 text-xs text-[#c7bfff]">View payments <ExternalLink className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          {data.orders.length ? (
            <div className="divide-y divide-white/[0.06]">
              {data.orders.slice(0, 8).map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => openOrderDetail(order)}
                >
                  <div>
                    <p className="text-sm text-white">{order.customer}</p>
                    <p className="text-xs text-white/35">{order.reference_id || order.id} {order.created_at ? `- ${new Date(order.created_at).toLocaleDateString()}` : ""}</p>
                    <p className="text-xs text-white/30">{order.customerEmail || ""} {order.customerPhone ? `- ${order.customerPhone}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-white/70">{formatMoney(order.amount || 0, order.currency)}</span>
                    <select
                      value={order.status || "pending"}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                      className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-xs capitalize text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/35 text-center py-6">No orders found.</p>
          )}
        </section>

        {orderDetailOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#19191d] p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Order detail</h3>
                  <p className="text-xs text-white/40">{selectedOrder.reference_id || selectedOrder.id}</p>
                </div>
                <button onClick={() => setOrderDetailOpen(false)} className="text-white/60 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-white/40">Customer</p>
                  <p className="text-white">{selectedOrder.customer}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Email</p>
                  <p className="text-white">{selectedOrder.customerEmail || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Phone</p>
                  <p className="text-white">{selectedOrder.customerPhone || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Amount</p>
                  <p className="text-white">{formatMoney(selectedOrder.amount || 0, selectedOrder.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Status</p>
                  <p className="text-white capitalize">{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Date</p>
                  <p className="text-white">{selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : "-"}</p>
                </div>
              </div>

              {orderDetailLoading ? (
                <p className="text-sm text-white/40 text-center py-4">Loading order details...</p>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-white">Items</h4>
                  {orderItems.length ? (
                    <div className="space-y-2">
                      {orderItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                          <div>
                            <p className="text-sm text-white">{item.name || item.product_name || "Item"}</p>
                            <p className="text-xs text-white/40">Qty: {item.quantity || 1}</p>
                          </div>
                          <span className="text-sm text-white/80">{formatMoney(Number(item.price || 0), item.currency || selectedOrder.currency || "NGN")}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-white/35">No item details available.</p>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">Messages</h4>
                <div className="max-h-60 overflow-y-auto space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  {messages.length ? (
                    messages.map((msg, idx) => (
                      <div key={idx} className={`text-xs p-2 rounded-lg ${msg.sender_type === "merchant" ? "bg-[#9d8df1]/15 text-white/80 ml-8" : "bg-white/[0.06] text-white/70 mr-8"}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold capitalize text-[10px] text-white/40">{msg.sender_type}</span>
                          <span className="text-[10px] text-white/25">{msg.created_at ? new Date(msg.created_at).toLocaleString() : ""}</span>
                        </div>
                        <p className="mt-1">{msg.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-white/25 text-center py-3">No messages yet.</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendOrderMessage();
                      }
                    }}
                    placeholder="Send a message to the customer..."
                    className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-[#9d8df1]"
                  />
                  <button
                    onClick={sendOrderMessage}
                    disabled={sendingMessage || !messageInput.trim()}
                    className="rounded-lg bg-[#9d8df1] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
