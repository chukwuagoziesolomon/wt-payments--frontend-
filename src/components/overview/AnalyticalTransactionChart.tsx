"use client";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionLoader } from "@/components/ui/LoadingAnimator";
import { authFetch } from "@/lib/auth-fetch";

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
      <div className="rounded-md border border-border bg-background px-3 py-2 text-xs shadow">
        <div className="text-muted-foreground">{entry.label}</div>
        <div className="font-bold">
          {entry.count} txn{entry.count !== 1 ? "s" : ""}
        </div>
        <div className="text-muted-foreground">
          ${entry.amount.toLocaleString()}
        </div>
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

    const apiBase = "/backend";
    authFetch(`${apiBase}/dashboard/analytical-transactions?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
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

    return () => {
      cancelled = true;
    };
  }, [period, year, month]);

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="font-semibold text-sm sm:text-base">
          Analytical Transaction
        </CardTitle>
        <div className="flex gap-1 text-xs">
          <button
            className={`rounded-md px-2 py-0.5 transition-colors sm:px-3 sm:py-1 ${
              period === "week"
                ? "bg-violet-600 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setPeriod("week")}
          >
            Week
          </button>
          <button
            className={`rounded-md px-2 py-0.5 transition-colors sm:px-3 sm:py-1 ${
              period === "month"
                ? "bg-violet-600 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setPeriod("month")}
          >
            Month
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[260px] w-full sm:h-[300px] md:h-[350px]">
          {loading ? (
            <SectionLoader message="Loading chart…" variant="bars" />
          ) : error ? (
            <div className="flex h-full items-center justify-center text-destructive text-sm">
              {error}
            </div>
          ) : (
            <ResponsiveContainer height="100%" width="100%">
              <BarChart
                barSize={period === "month" ? 12 : 40}
                data={chartData}
                maxBarSize={60}
              >
                <defs>
                  <linearGradient
                    id="purple-gradient"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#6d28d9" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="#33343a"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  dataKey="label"
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
                  content={<CustomTooltip />}
                  cursor={{ fill: "#262626" }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      fill={
                        entry.count === maxCount && entry.count > 0
                          ? "url(#purple-gradient)"
                          : "#262626"
                      }
                      key={`cell-${index}`}
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
