"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, CartesianGrid } from "recharts";
import { SectionLoader } from "@/components/ui/LoadingAnimator";

type Period = "week" | "month";

type ChartItem = {
  label: string;
  count: number;
  amount: number;
};

type ApiResponse = {
  error: boolean;
  result?: {
    period: Period;
    year: number;
    total_count: number;
    total_amount: number;
    data: ChartItem[];
  };
};

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const entry: ChartItem = payload[0].payload;
    return (
      <div className="rounded-md bg-background px-3 py-2 text-xs shadow border border-border">
        <div className="text-muted-foreground">{entry.label}</div>
        <div className="font-bold">{entry.count} txn{entry.count !== 1 ? "s" : ""}</div>
        <div className="text-muted-foreground">${entry.amount.toLocaleString()}</div>
      </div>
    );
  }
  return null;
}

export function AnalyticalTransactionChart() {
  const now = new Date();
  const [period, setPeriod] = React.useState<Period>("week");
  const [year] = React.useState(now.getFullYear());
  const [month] = React.useState(now.getMonth() + 1);
  const [chartData, setChartData] = React.useState<ChartItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ period });
    if (period === "month") {
      params.set("year", String(year));
      params.set("month", String(month));
    }

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("authToken") || localStorage.getItem("token")
        : null;

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";
    fetch(`${apiBase}/dashboard/analytical-transactions?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
      cache: "no-store",
    })
      .then((r) => r.json() as Promise<ApiResponse>)
      .then((json) => {
        if (cancelled) return;
        if (json.error || !json.result) {
          setError("Failed to load chart data");
          setChartData([]);
        } else {
          setChartData(json.result.data);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load chart data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [period, year, month]);

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Analytical Transaction</CardTitle>
        <div className="flex gap-1 text-xs">
          <button
            onClick={() => setPeriod("week")}
            className={`px-3 py-1 rounded-md transition-colors ${
              period === "week"
                ? "bg-violet-600 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`px-3 py-1 rounded-md transition-colors ${
              period === "month"
                ? "bg-violet-600 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Month
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px] md:h-[350px]">
          {loading ? (
            <SectionLoader variant="bars" message="Loading chart…" />
          ) : error ? (
            <div className="flex items-center justify-center h-full text-sm text-destructive">
              {error}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={period === "month" ? 12 : 40} maxBarSize={60}>
                <defs>
                  <linearGradient id="purple-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#6d28d9" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#33343a" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} stroke="#A1A1AA" tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} stroke="#A1A1AA" allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#262626" }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.count === maxCount && entry.count > 0 ? "url(#purple-gradient)" : "#262626"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
