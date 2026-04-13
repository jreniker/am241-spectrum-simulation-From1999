"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  initializeSimulation,
  runSimulationBatch,
  type SimulationParams,
  type SimulationState,
} from "@/lib/am241-simulation";

const DEFAULT_PARAMS: SimulationParams = {
  channelWidth: 0.1542,
  detectorResolution: 0.055,
  maxEvents: 1000,
};

const BATCH_SIZE = 10; // Events per frame for smooth animation
const FRAME_DELAY = 16; // ~60fps

export function useSimulation() {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [state, setState] = useState<SimulationState>(initializeSimulation());
  const animationRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);

  const runFrame = useCallback(() => {
    if (!isRunningRef.current) return;

    setState((currentState) => {
      const newState = runSimulationBatch(currentState, params, BATCH_SIZE);
      
      if (!newState.isRunning) {
        isRunningRef.current = false;
      }
      
      return newState;
    });

    if (isRunningRef.current) {
      animationRef.current = window.setTimeout(() => {
        requestAnimationFrame(runFrame);
      }, FRAME_DELAY);
    }
  }, [params]);

  const start = useCallback(() => {
    if (state.events >= params.maxEvents) {
      // Reset if already complete
      setState(initializeSimulation());
    }
    isRunningRef.current = true;
    setState((s) => ({ ...s, isRunning: true }));
    requestAnimationFrame(runFrame);
  }, [runFrame, state.events, params.maxEvents]);

  const pause = useCallback(() => {
    isRunningRef.current = false;
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
    setState((s) => ({ ...s, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    pause();
    setState(initializeSimulation());
  }, [pause]);

  const exportCSV = useCallback(() => {
    const csvRows = ["Channel,Energy (keV),Counts"];
    state.spectrum.forEach((counts, channel) => {
      if (counts > 0) {
        csvRows.push(`${channel},${(channel * params.channelWidth).toFixed(3)},${counts}`);
      }
    });
    
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `am241_spectrum_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.spectrum, params.channelWidth]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return {
    params,
    setParams,
    state,
    start,
    pause,
    reset,
    exportCSV,
  };
}
