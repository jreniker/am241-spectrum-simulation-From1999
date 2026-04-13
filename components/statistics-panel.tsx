"use client";

import { useMemo } from "react";
import { findPeaks, type SimulationState, type SimulationParams } from "@/lib/am241-simulation";

interface StatisticsPanelProps {
  state: SimulationState;
  params: SimulationParams;
}

export function StatisticsPanel({ state, params }: StatisticsPanelProps) {
  const peaks = useMemo(() => {
    return findPeaks(state.spectrum, params.channelWidth, 3);
  }, [state.spectrum, params.channelWidth]);

  const totalCounts = useMemo(() => {
    return state.spectrum.reduce((sum, c) => sum + c, 0);
  }, [state.spectrum]);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-secondary/50 p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Events</div>
          <div className="mt-1 font-mono text-2xl text-foreground">{state.events.toLocaleString()}</div>
        </div>
        <div className="rounded-lg bg-secondary/50 p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Detected Counts</div>
          <div className="mt-1 font-mono text-2xl text-foreground">{totalCounts.toLocaleString()}</div>
        </div>
      </div>

      {/* Compton Scatter Statistics */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Compton Scatter Statistics</h3>
        <div className="space-y-2">
          {state.scatterStats.slice(0, 6).map((count, scatters) => {
            const percentage = state.events > 0 ? (count / state.events) * 100 : 0;
            return (
              <div key={scatters} className="flex items-center gap-3">
                <span className="w-24 text-xs text-muted-foreground">
                  {scatters === 0 ? "No scatter" : `${scatters} scatter${scatters > 1 ? "s" : ""}`}
                </span>
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <span className="w-16 text-right font-mono text-xs text-muted-foreground">
                  {count.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detected Peaks */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Detected Peaks</h3>
        {peaks.length > 0 ? (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {peaks.map((peak, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded bg-secondary/30 px-3 py-2"
              >
                <span className="font-mono text-sm text-primary">
                  {peak.energy.toFixed(2)} keV
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {peak.counts} counts
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Run simulation to detect peaks...
          </p>
        )}
      </div>

      {/* Am-241 Reference Lines */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Am-241 Reference Lines</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded bg-secondary/30 px-2 py-1">
            <span className="text-accent">59.54 keV</span>
            <span className="text-muted-foreground ml-1">- Main γ</span>
          </div>
          <div className="rounded bg-secondary/30 px-2 py-1">
            <span className="text-accent">26.36 keV</span>
            <span className="text-muted-foreground ml-1">- Np Lγ</span>
          </div>
          <div className="rounded bg-secondary/30 px-2 py-1">
            <span className="text-accent">17.78 keV</span>
            <span className="text-muted-foreground ml-1">- Np Lβ</span>
          </div>
          <div className="rounded bg-secondary/30 px-2 py-1">
            <span className="text-accent">13.95 keV</span>
            <span className="text-muted-foreground ml-1">- Np Lα</span>
          </div>
        </div>
      </div>
    </div>
  );
}
