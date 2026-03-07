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

export default function ResultsRadarChart({ data }: { data: RadarDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="factor"
          tick={{ fontSize: 10, fill: "#64748b" }}
        />
        <Radar
          name="スコア"
          dataKey="score"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Tooltip
          formatter={(value) => [`${value}点`, "スコア"]}
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
