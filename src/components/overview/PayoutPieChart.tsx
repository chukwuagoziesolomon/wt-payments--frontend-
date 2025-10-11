"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Pending payout", value: 250, color: "#B9FFB7" },
  { name: "Processing payout", value: 250, color: "#E5C7A9" },
  { name: "Current pending interval", value: 250, color: "#A7A7FF" },
];

export function PayoutPieChart() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Payout</CardTitle>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          View All <span className="ml-1">&gt;</span>
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="w-full flex justify-center items-center" style={{ height: 280 }}>
            <ResponsiveContainer width={280} height={280}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  stroke="#1A1A1A"
                  strokeWidth={12}
                >
                  {data.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                {/* Centered label */}
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-lg font-bold fill-white"
                >
                  Total $250
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="mt-4 w-full flex flex-col gap-2">
            {data.map((entry, idx) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.name}</span>
                </div>
                <span className="text-sm font-medium">${entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
