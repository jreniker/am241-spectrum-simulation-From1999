"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface SpectrumChartProps {
  spectrum: number[];
  channelWidth: number;
  maxChannel: number;
}

const AM241_LINES = [
  { energy: 59.54, label: "59.5 keV" },
  { energy: 26.36, label: "26.4 keV" },
  { energy: 17.78, label: "17.8 keV" },
  { energy: 13.95, label: "14.0 keV" },
];

export function SpectrumChart({ spectrum, channelWidth, maxChannel }: SpectrumChartProps) {
  const data = useMemo(() => {
    const displayMax = Math.min(Math.max(maxChannel + 50, 100), 500);
    return spectrum.slice(0, displayMax).map((counts, channel) => ({
      channel,
      energy: (channel * channelWidth).toFixed(1),
      counts,
    }));
  }, [spectrum, channelWidth, maxChannel]);

  const maxCounts = useMemo(() => {
    return Math.max(...spectrum.slice(0, 500), 1);
  }, [spectrum]);

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
          <defs>
            <linearGradient id="spectrumGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.65 0.18 200)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="oklch(0.65 0.18 200)" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 250)" />
          <XAxis
            dataKey="energy"
            stroke="oklch(0.65 0 0)"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "oklch(0.28 0.01 250)" }}
            label={{
              value: "Energy (keV)",
              position: "bottom",
              offset: 10,
              fill: "oklch(0.65 0 0)",
              fontSize: 12,
            }}
            interval={Math.floor(data.length / 10)}
          />
          <YAxis
            stroke="oklch(0.65 0 0)"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "oklch(0.28 0.01 250)" }}
            label={{
              value: "Counts",
              angle: -90,
              position: "insideLeft",
              fill: "oklch(0.65 0 0)",
              fontSize: 12,
            }}
            domain={[0, maxCounts * 1.1]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.17 0.01 250)",
              border: "1px solid oklch(0.28 0.01 250)",
              borderRadius: "8px",
              color: "oklch(0.95 0 0)",
            }}
            labelFormatter={(label) => `Energy: ${label} keV`}
            formatter={(value: number) => [`${value}`, "Counts"]}
          />
          {AM241_LINES.map((line) => (
            <ReferenceLine
              key={line.energy}
              x={(line.energy / channelWidth).toFixed(1)}
              stroke="oklch(0.7 0.15 145)"
              strokeDasharray="5 5"
              strokeOpacity={0.5}
            />
          ))}
          <Area
            type="stepAfter"
            dataKey="counts"
            stroke="oklch(0.65 0.18 200)"
            fill="url(#spectrumGradient)"
            strokeWidth={1.5}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
