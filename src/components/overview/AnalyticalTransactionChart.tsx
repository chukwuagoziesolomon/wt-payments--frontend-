"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, CartesianGrid } from "recharts";

const data = [
  { name: "Mon", value: 0 },
  { name: "Tues", value: 80, date: "2nd June", amount: "50 USD" },
  { name: "Wed", value: 0 },
  { name: "Thur", value: 0 },
  { name: "Fri", value: 40 },
  { name: "Sat", value: 0 },
  { name: "Sun", value: 0 },
];

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length && payload[0].payload.date) {
    return (
      <div className="rounded-md bg-background px-3 py-2 text-xs shadow">
        <div>{payload[0].payload.date}</div>
        <div className="font-bold">{payload[0].payload.amount}</div>
      </div>
    );
  }
  return null;
}

export function AnalyticalTransactionChart() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Analytical Transaction</CardTitle>
        <span className="text-xs text-muted-foreground">Time ▼</span>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px] md:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={40} maxBarSize={60}>
              <CartesianGrid stroke="#33343a" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#A1A1AA" />
              <YAxis axisLine={false} tickLine={false} stroke="#A1A1AA" />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#262626" }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 1 ? "url(#purple-gradient)" : "#262626"}
                    strokeDasharray={index === 4 ? "4 2" : undefined}
                  />
                ))}
              </Bar>
              <defs>
                <linearGradient id="purple-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#6d28d9" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
