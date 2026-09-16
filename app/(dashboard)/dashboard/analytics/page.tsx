"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionLoader } from "@/components/ui/LoadingAnimator";
import { authFetch } from "@/lib/auth-fetch";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API = "/backend";

type TimeSeriesPoint = {
  period: string;
  order_count: number;
  total_amount: number;
};

type AnalyticsResponse = {
  total_orders?: number;
  total_revenue?: number;
  unique_customers?: number;
  link_clicks?: number;
  time_series?: TimeSeriesPoint[];
};

type PaymentLinkAnalytics = {
  slug: string;
  usage_count: number;
  order_count: number;
  revenue: number;
};

export default function AnalyticsPage() {
  const { notify } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [analytics, setAnalytics] = React.useState<AnalyticsResponse | null>(null);
  const [linkAnalytics, setLinkAnalytics] = React.useState<PaymentLinkAnalytics[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("authToken") || localStorage.getItem("token")
            : null;

        const [ordersAnalyticsRes, linksAnalyticsRes] = await Promise.all([
          authFetch(`${API}/user/shop/orders/analytics`, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            cache: "no-store",
          }),
          authFetch(`${API}/client/payment-links/analytics`, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            cache: "no-store",
          }),
        ]);

        const ordersJson = await ordersAnalyticsRes.json().catch(() => ({}));
        const linksJson = await linksAnalyticsRes.json().catch(() => ({}));

        if (!ordersAnalyticsRes.ok || ordersJson.error) {
          throw new Error(
            typeof ordersJson.data === "string"
              ? ordersJson.data
              : ordersAnalyticsRes.status === 401
                ? "Your session has expired. Please log in again."
                : ordersAnalyticsRes.status >= 500
                  ? "Analytics service is temporarily unavailable."
                  : `Failed to load analytics (status ${ordersAnalyticsRes.status}).`
          );
        }

        if (!cancelled) {
          setAnalytics((ordersJson.result || ordersJson.data || {}) as AnalyticsResponse);
          const linksData = linksJson.result?.links ?? linksJson.data?.links ?? [];
          setLinkAnalytics(Array.isArray(linksData) ? linksData : []);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load analytics.";
          setError(message);
          notify(message);
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
  }, [notify]);

  const timeSeries = analytics?.time_series || [];

  const maxAmount = Math.max(...timeSeries.map((d) => d.total_amount), 1);
  const maxOrders = Math.max(...timeSeries.map((d) => d.order_count), 1);

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9d8df1]">Insights</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Revenue, orders, and payment link performance.</p>
        </header>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <SectionLoader message="Loading analytics…" variant="bars" />
          </div>
        )}

        {error && !loading && (
          <Card className="bg-[#19191d] border-border">
            <CardContent className="py-12 text-center text-sm text-red-400">{error}</CardContent>
          </Card>
        )}

        {!loading && !error && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Revenue" value={`${(analytics?.total_revenue || 0).toLocaleString()} NGN`} detail={`${analytics?.total_orders || 0} orders`} />
              <MetricCard label="Orders" value={String(analytics?.total_orders || 0)} detail={`${analytics?.unique_customers || 0} unique customers`} />
              <MetricCard label="Customers" value={String(analytics?.unique_customers || 0)} detail="Unique buyers" />
              <MetricCard label="Link clicks" value={String(analytics?.link_clicks || 0)} detail="Payment link visits" />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <Card className="bg-[#19191d] border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-white">Revenue over time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] w-full">
                    {timeSeries.length ? (
                      <ResponsiveContainer height="100%" width="100%">
                        <LineChart data={timeSeries}>
                          <CartesianGrid stroke="#33343a" strokeDasharray="3 3" vertical={false} />
                          <XAxis
                            axisLine={false}
                            dataKey="period"
                            interval="preserveEnd"
                            minTickGap={4}
                            stroke="#A1A1AA"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                          />
                          <YAxis
                            axisLine={false}
                            stroke="#A1A1AA"
                            tickLine={false}
                          />
                          <Tooltip
                            formatter={(value: any) => [`${Number(value).toLocaleString()} NGN`, "Revenue"]}
                            cursor={{ fill: "#262626" }}
                          />
                          <Line dataKey="total_amount" stroke="#9d8df1" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="flex h-full items-center justify-center text-sm text-white/35">No revenue data yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#19191d] border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-white">Orders over time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] w-full">
                    {timeSeries.length ? (
                      <ResponsiveContainer height="100%" width="100%">
                        <BarChart data={timeSeries}>
                          <defs>
                            <linearGradient id="analytics-bar-gradient" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#a78bfa" />
                              <stop offset="100%" stopColor="#6d28d9" />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="#33343a" strokeDasharray="3 3" vertical={false} />
                          <XAxis
                            axisLine={false}
                            dataKey="period"
                            interval="preserveEnd"
                            minTickGap={4}
                            stroke="#A1A1AA"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                          />
                          <YAxis
                            allowDecimals={false}
                            axisLine={false}
                            stroke="#A1A1AA"
                            tickLine={false}
                          />
                          <Tooltip
                            formatter={(value: any) => [`${Number(value).toLocaleString()} orders`, "Orders"]}
                            cursor={{ fill: "#262626" }}
                          />
                          <Bar dataKey="order_count" radius={[8, 8, 0, 0]}>
                            {timeSeries.map((entry, index) => (
                              <Cell fill="url(#analytics-bar-gradient)" key={`cell-${index}`} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="flex h-full items-center justify-center text-sm text-white/35">No order data yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>

            {linkAnalytics.length > 0 && (
              <section className="rounded-2xl border border-white/[0.08] bg-[#19191d] p-5 sm:p-6">
                <div className="mb-4">
                  <h2 className="font-semibold text-white">Payment link performance</h2>
                  <p className="mt-1 text-xs text-white/35">Usage and conversion by link</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-xs text-white/40">
                        <th className="pb-2 font-medium">Slug</th>
                        <th className="pb-2 font-medium">Visits</th>
                        <th className="pb-2 font-medium">Orders</th>
                        <th className="pb-2 font-medium">Revenue</th>
                        <th className="pb-2 font-medium">Conversion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {linkAnalytics.map((link) => (
                        <tr key={link.slug}>
                          <td className="py-3 text-white">{link.slug}</td>
                          <td className="py-3 text-white/70">{link.usage_count.toLocaleString()}</td>
                          <td className="py-3 text-white/70">{link.order_count.toLocaleString()}</td>
                          <td className="py-3 text-white/70">{link.revenue.toLocaleString()} NGN</td>
                          <td className="py-3 text-white/70">
                            {link.usage_count > 0 ? `${((link.order_count / link.usage_count) * 100).toFixed(1)}%` : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card className="bg-[#19191d] border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-white/55">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-white">{value}</p>
        <p className="mt-1 text-xs text-white/35">{detail}</p>
      </CardContent>
    </Card>
  );
}
