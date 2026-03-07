"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RadarDataPoint {
  factor: string;
  score: number;
}

export default function TeamRadarChart({ data }: { data: RadarDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="factor"
          tick={{ fontSize: 10, fill: "#64748b" }}
        />
        <Radar
          name="チーム平均"
          dataKey="score"
          stroke="#22c55e"
          fill="#22c55e"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Tooltip
          formatter={(value) => [`${value}点`, "チーム平均"]}
          contentStyle={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "0.85rem",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
