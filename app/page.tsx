"use client";

import { useSimulation } from "@/hooks/use-simulation";
import { SpectrumChart } from "@/components/spectrum-chart";
import { SimulationControls } from "@/components/simulation-controls";
import { StatisticsPanel } from "@/components/statistics-panel";
import { Atom, Activity } from "lucide-react";

export default function Am241Simulator() {
  const { params, setParams, state, start, pause, reset, exportCSV } = useSimulation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Atom className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Am-241 Spectrum Simulator
              </h1>
              <p className="text-sm text-muted-foreground">
                Von Neumann Monte Carlo Simulation
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {state.isRunning && (
                <div className="flex items-center gap-2 text-accent">
                  <Activity className="h-4 w-4 animate-pulse" />
                  <span className="text-sm font-medium">Simulating...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Spectrum Chart */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-medium text-foreground">
                  Gamma Spectrum
                </h2>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    <span className="inline-block h-2 w-2 rounded-full bg-primary mr-1" />
                    Spectrum
                  </span>
                  <span>
                    <span className="inline-block h-2 w-2 rounded-full bg-accent mr-1" />
                    Reference Lines
                  </span>
                </div>
              </div>
              <SpectrumChart
                spectrum={state.spectrum}
                channelWidth={params.channelWidth}
                maxChannel={state.maxChannel}
              />
              {/* Energy Scale */}
              <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                <span>0 keV</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>40</span>
                <span>50</span>
                <span>60+</span>
              </div>
            </div>

            {/* Physics Info */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-sm font-medium text-foreground">
                Simulation Physics
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <h3 className="text-xs font-medium text-primary">Von Neumann Rejection</h3>
                  <p className="text-xs text-muted-foreground">
                    Path lengths sampled from exponential distribution using acceptance-rejection method.
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-medium text-primary">Klein-Nishina Formula</h3>
                  <p className="text-xs text-muted-foreground">
                    Compton scatter angles weighted by differential cross-section and Jacobian.
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-medium text-primary">Detector Response</h3>
                  <p className="text-xs text-muted-foreground">
                    Gaussian energy broadening via central limit theorem (sum of 12 uniforms).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Controls */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-sm font-medium text-foreground">
                Simulation Controls
              </h2>
              <SimulationControls
                params={params}
                state={state}
                onParamsChange={setParams}
                onStart={start}
                onPause={pause}
                onReset={reset}
                onExport={exportCSV}
              />
            </div>

            {/* Statistics */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-sm font-medium text-foreground">
                Statistics
              </h2>
              <StatisticsPanel state={state} params={params} />
            </div>
          </aside>
        </div>

        {/* Footer Info */}
        <footer className="mt-8 border-t border-border pt-6">
          <div className="text-center text-xs text-muted-foreground">
            <p>
              Originally written in QuickBASIC 4.5 (circa 1994) for germanium detector simulation.
            </p>
            <p className="mt-1">
              Converted to modern web application preserving all Monte Carlo physics algorithms.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
