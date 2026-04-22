"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ChartDataPoint } from "@/app/api/analytics/route";

const PLATFORM_COLORS: Record<string, string> = {
  Twitter: "#1DA1F2",
  LinkedIn: "#0A66C2",
  Instagram: "#E1306C",
  YouTube: "#FF0000",
};

interface PlatformChartProps {
  data: ChartDataPoint[];
  activePlatforms: string[];
}

export function PlatformChart({ data, activePlatforms }: PlatformChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) =>
            v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
          }
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--surface-elevated))",
            borderColor: "hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--text-primary))",
          }}
          itemStyle={{ color: "hsl(var(--text-primary))" }}
        />
        <Legend wrapperStyle={{ paddingTop: "20px" }} />
        {activePlatforms.map((platform) => (
          <Bar
            key={platform}
            dataKey={platform}
            fill={PLATFORM_COLORS[platform] ?? "#888"}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
