"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { SectionLoader } from "@/components/ui/LoadingAnimator";
import { authFetch } from "@/lib/auth-fetch";

type BreakdownItem = {
  label: string;
  value: number;
  color: string;
};

type PayoutChartResult = {
  total: number;
  breakdown: BreakdownItem[];
};

const FALLBACK: PayoutChartResult = {
  total: 0,
  breakdown: [
    { label: "Pending payout", value: 0, color: "#B9FFB7" },
    { label: "Processing payout", value: 0, color: "#E5C7A9" },
    { label: "Current pending interval", value: 0, color: "#A7A7FF" },
  ],
};

export function PayoutPieChart() {
  const [result, setResult] = React.useState<PayoutChartResult>(FALLBACK);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("authToken") || localStorage.getItem("token")
            : null;
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const apiBase = "/backend";
        const res = await authFetch(`${apiBase}/dashboard/payout-chart`, {
          method: "GET",
          headers,
          cache: "no-store",
        });

        const payload = await res.json().catch(() => null);
        if (!res.ok || payload?.error) {
          throw new Error(
            typeof payload?.data === "string" ? payload.data : `Error ${res.status}`
          );
        }

        if (mounted && payload?.result) {
          setResult(payload.result);
        }
      } catch (err: unknown) {
        if (mounted)
          setError(err instanceof Error ? err.message : "Failed to load payout chart");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const chartData = result.breakdown.map((b) => ({
    name: b.label,
    value: b.value,
    color: b.color,
  }));

  // When all values are 0 render a grey placeholder slice so the donut still shows
  const isEmpty = chartData.every((d) => d.value === 0);
  const displayData = isEmpty
    ? [{ name: "No data", value: 1, color: "#2a2a2a" }]
    : chartData;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Payout</CardTitle>
        <button
          className="text-xs text-muted-foreground flex items-center gap-1"
          onClick={() => { window.location.href = "/dashboard/payout"; }}
        >
          View All <span className="ml-1">&gt;</span>
        </button>
      </CardHeader>
      <CardContent>
        {loading && <SectionLoader variant="ring" message="Loading payout data…" height={180} />}
        {!loading && error && (
          <p className="text-xs text-destructive mb-2">{error}</p>
        )}
        <div className="flex flex-col items-center">
          <div className="w-full flex justify-center items-center" style={{ height: 280 }}>
            <ResponsiveContainer width={280} height={280}>
              <PieChart>
                <Pie
                  data={displayData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  stroke="#1A1A1A"
                  strokeWidth={12}
                  isAnimationActive={!loading}
                >
                  {displayData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <text
                  x="50%"
                  y="46%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#9ca3af"
                  fontSize={12}
                >
                  {loading ? "Loading…" : "Total"}
                </text>
                <text
                  x="50%"
                  y="56%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#ffffff"
                  fontSize={20}
                  fontWeight="bold"
                >
                  ${result.total.toLocaleString()}
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="mt-4 w-full flex flex-col gap-2">
            {result.breakdown.map((entry) => (
              <div key={entry.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.label}</span>
                </div>
                <span className="text-sm font-medium">
                  ${entry.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
