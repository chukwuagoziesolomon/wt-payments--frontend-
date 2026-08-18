"use client";

import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
            typeof payload?.data === "string"
              ? payload.data
              : `Error ${res.status}`
          );
        }

        if (mounted && payload?.result) {
          setResult(payload.result);
        }
      } catch (err: unknown) {
        if (mounted)
          setError(
            err instanceof Error ? err.message : "Failed to load payout chart"
          );
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
        <CardTitle className="font-semibold text-base">Payout</CardTitle>
        <button
          className="flex items-center gap-1 text-muted-foreground text-xs"
          onClick={() => {
            window.location.href = "/dashboard/payout";
          }}
        >
          View All <span className="ml-1">&gt;</span>
        </button>
      </CardHeader>
      <CardContent>
        {loading && (
          <SectionLoader
            height={180}
            message="Loading payout data…"
            variant="ring"
          />
        )}
        {!loading && error && (
          <p className="mb-2 text-destructive text-xs">{error}</p>
        )}
        <div className="flex flex-col items-center">
          <div className="flex h-[220px] w-full items-center justify-center sm:h-[280px]">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={displayData}
                  dataKey="value"
                  endAngle={-270}
                  innerRadius={70}
                  isAnimationActive={!loading}
                  outerRadius={110}
                  startAngle={90}
                  stroke="#1A1A1A"
                  strokeWidth={12}
                >
                  {displayData.map((entry, idx) => (
                    <Cell fill={entry.color} key={`cell-${idx}`} />
                  ))}
                </Pie>
                <text
                  dominantBaseline="middle"
                  fill="#9ca3af"
                  fontSize={12}
                  textAnchor="middle"
                  x="50%"
                  y="46%"
                >
                  {loading ? "Loading…" : "Total"}
                </text>
                <text
                  dominantBaseline="middle"
                  fill="#ffffff"
                  fontSize={20}
                  fontWeight="bold"
                  textAnchor="middle"
                  x="50%"
                  y="56%"
                >
                  ${result.total.toLocaleString()}
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="mt-4 flex w-full flex-col gap-2">
            {result.breakdown.map((entry) => (
              <div
                className="flex items-center justify-between"
                key={entry.label}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.label}</span>
                </div>
                <span className="font-medium text-sm">
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
