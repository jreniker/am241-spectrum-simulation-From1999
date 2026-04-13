"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, Download } from "lucide-react";
import type { SimulationParams, SimulationState } from "@/lib/am241-simulation";

interface SimulationControlsProps {
  params: SimulationParams;
  state: SimulationState;
  onParamsChange: (params: SimulationParams) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onExport: () => void;
}

export function SimulationControls({
  params,
  state,
  onParamsChange,
  onStart,
  onPause,
  onReset,
  onExport,
}: SimulationControlsProps) {
  const progress = (state.events / params.maxEvents) * 100;

  return (
    <div className="space-y-6">
      {/* Control Buttons */}
      <div className="flex flex-wrap gap-3">
        {state.isRunning ? (
          <Button onClick={onPause} variant="secondary" className="gap-2">
            <Pause className="h-4 w-4" />
            Pause
          </Button>
        ) : (
          <Button onClick={onStart} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Play className="h-4 w-4" />
            {state.events > 0 ? "Resume" : "Start"}
          </Button>
        )}
        <Button onClick={onReset} variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        <Button onClick={onExport} variant="outline" className="gap-2" disabled={state.events === 0}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-mono text-foreground">
            {state.events.toLocaleString()} / {params.maxEvents.toLocaleString()} events
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Parameters */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Max Events</span>
            <span className="font-mono text-foreground">{params.maxEvents.toLocaleString()}</span>
          </div>
          <Slider
            value={[params.maxEvents]}
            onValueChange={([value]) => onParamsChange({ ...params, maxEvents: value })}
            min={100}
            max={10000}
            step={100}
            disabled={state.isRunning}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Channel Width</span>
            <span className="font-mono text-foreground">{params.channelWidth.toFixed(3)} keV/ch</span>
          </div>
          <Slider
            value={[params.channelWidth * 1000]}
            onValueChange={([value]) => onParamsChange({ ...params, channelWidth: value / 1000 })}
            min={50}
            max={500}
            step={10}
            disabled={state.isRunning}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Detector Resolution</span>
            <span className="font-mono text-foreground">{(params.detectorResolution * 100).toFixed(1)}%</span>
          </div>
          <Slider
            value={[params.detectorResolution * 1000]}
            onValueChange={([value]) => onParamsChange({ ...params, detectorResolution: value / 1000 })}
            min={10}
            max={200}
            step={5}
            disabled={state.isRunning}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
