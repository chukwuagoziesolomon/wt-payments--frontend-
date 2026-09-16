"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionLoader } from "@/components/ui/LoadingAnimator";
import { authFetch } from "@/lib/auth-fetch";
import { useToast } from "@/components/ui/ToastProvider";
import {
  BarChart3,
  Boxes,
  CheckCircle2,
  Clock3,
  Package,
  RefreshCw,
  Settings,
  Store,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";

const API = "/backend";

function tokenHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") || localStorage.getItem("token") || "" : "";
  return { Authorization: `Bearer ${token}` };
}

function formatMoney(value: number, currency = "NGN") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(value || 0);
}

export default function ShopDashboardOverviewPage() {
  const router = useRouter();
  const { notify } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [shop, setShop] = React.useState<any>(null);
  const [metrics, setMetrics] = React.useState({
    revenue: "0",
    orders: "0",
    products: "0",
    pendingOrders: "0",
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [shopRes, productsRes, ordersRes, analyticsRes] = await Promise.all([
        authFetch(`${API}/user/shop`, { headers: tokenHeaders() }),
        authFetch(`${API}/user/shop/products?page=1&limit=1`, { headers: tokenHeaders() }),
        authFetch(`${API}/user/shop/orders?page=1&limit=50`, { headers: tokenHeaders() }),
        authFetch(`${API}/user/shop/orders/analytics`, { headers: tokenHeaders() }),
      ]);

      const shopJson = await shopRes.json().catch(() => ({}));
      const productsJson = await productsRes.json().catch(() => ({}));
      const ordersJson = await ordersRes.json().catch(() => ({}));
      const analyticsJson = await analyticsRes.json().catch(() => ({}));

      if (shopRes.ok && shopJson.result) {
        setShop(shopJson.result);
      }

      const productPayload = productsJson.result ?? productsJson.data ?? {};
      const productCount = Number(productPayload.meta?.total ?? productPayload.total ?? 0);

      const ordersList = ordersJson.result?.orders ?? ordersJson.data?.orders ?? ordersJson.data ?? [];
      const analyticsData = analyticsJson.result ?? analyticsJson.data ?? {};
      const pendingOrders = Array.isArray(ordersList) ? ordersList.filter((o: any) => ["pending", "processing"].includes((o.order_status ?? o.status ?? "").toLowerCase())).length : 0;

      setMetrics({
        revenue: formatMoney(Number(analyticsData.total_revenue ?? 0)),
        orders: String(analyticsData.total_orders ?? ordersList.length ?? 0),
        products: String(productCount),
        pendingOrders: String(pendingOrders),
      });
    } catch {
      notify("Failed to load shop dashboard");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9d8df1]">Shop Owner</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              {shop?.business_name ? `${shop.business_name} Dashboard` : "Shop Dashboard"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage products, track orders, and view insights.</p>
          </div>
          <Button onClick={load} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <SectionLoader message="Loading shop dashboard…" variant="bars" />
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Revenue" value={metrics.revenue} detail="Total processed" icon={TrendingUp} />
              <MetricCard label="Orders" value={metrics.orders} detail="All time" icon={Package} />
              <MetricCard label="Products" value={metrics.products} detail="In catalog" icon={Boxes} />
              <MetricCard label="Pending orders" value={metrics.pendingOrders} detail="Need attention" icon={Clock3} />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <Card className="bg-[#19191d] border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-white">Quick actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <ActionButton label="Manage products" icon={Package} onClick={() => router.push("/shop/products")} />
                  <ActionButton label="View orders" icon={Truck} onClick={() => router.push("/shop/admin")} />
                  <ActionButton label="Analytics" icon={BarChart3} onClick={() => router.push("/shop/analytics")} />
                  <ActionButton label="Payment links" icon={CheckCircle2} onClick={() => router.push("/shop/payment-links")} />
                  <ActionButton label="Shop settings" icon={Settings} onClick={() => router.push("/shop/settings")} />
                  <ActionButton label="Delivery settings" icon={Truck} onClick={() => router.push("/shop/settings")} />
                </CardContent>
              </Card>

              <Card className="bg-[#19191d] border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-white">Shop status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-white capitalize">{shop?.status || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Currency</span>
                    <span className="text-white">{shop?.currency || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subdomain</span>
                    <span className="text-white">{shop?.subdomain || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Template</span>
                    <span className="text-white capitalize">{shop?.template ? shop.template.replace(/-/g, " ") : "-"}</span>
                  </div>
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function MetricCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Store }) {
  return (
    <Card className="bg-[#19191d] border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium text-white/55">{label}</CardTitle>
          <Icon className="h-4 w-4 text-[#9d8df1]" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-white">{value}</p>
        <p className="mt-1 text-xs text-white/35">{detail}</p>
      </CardContent>
    </Card>
  );
}

function ActionButton({ label, icon: Icon, onClick }: { label: string; icon: typeof Store; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-left text-sm text-white/70 hover:border-white/[0.18] hover:text-white transition-colors"
    >
      <Icon className="h-4 w-4 text-[#9d8df1]" />
      {label}
    </button>
  );
}
