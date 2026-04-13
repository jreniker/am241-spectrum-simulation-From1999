// Am-241 Spectrum Simulation using Von Neumann Monte Carlo Methods
// Converted from QuickBASIC 4.5 (circa 1994)

const PI = Math.PI;

// Am-241 emission lines with relative intensities
const AM241_EMISSIONS = [
  { energy: 59.54, probability: 1.0 },    // Main gamma line
  { energy: 26.36, probability: 0.06 },   // X-ray
  { energy: 21.43, probability: 0.01 },   // L X-ray
  { energy: 21.09, probability: 0.01 },   // L X-ray
  { energy: 20.79, probability: 0.05 },   // L X-ray
  { energy: 17.78, probability: 0.2 },    // Np L X-ray
  { energy: 17.06, probability: 0.04 },   // L X-ray
  { energy: 16.82, probability: 0.04 },   // L X-ray
  { energy: 13.95, probability: 0.13 },   // L X-ray
];

export interface SimulationParams {
  channelWidth: number;    // keV per channel (default 0.1542)
  detectorResolution: number; // Resolution factor (default 0.055)
  maxEvents: number;       // Number of events to simulate
}

export interface SimulationState {
  spectrum: number[];
  events: number;
  scatterStats: number[];
  isRunning: boolean;
  maxChannel: number;
}

// Detector material properties (Germanium-like)
const DETECTOR = {
  Z: 32,           // Atomic number (Ge)
  MW: 72.64,       // Molecular weight
  DENS: 5.323,     // Density g/cm³
};

/**
 * Generate Am-241 emission energy using rejection sampling
 */
export function emitPhoton(): number {
  while (true) {
    const idx = Math.floor(Math.random() * AM241_EMISSIONS.length);
    const emission = AM241_EMISSIONS[idx];
    if (Math.random() < emission.probability) {
      return emission.energy;
    }
  }
}

/**
 * Calculate cross sections for a given energy
 * Returns: { compton, photoelectric, total, comptonFraction, photoFraction }
 */
export function calculateCrossSections(energy: number) {
  if (energy <= 0) {
    return { compton: 0, photoelectric: 0, total: 0, comptonFraction: 0, photoFraction: 0 };
  }

  const { Z, MW, DENS } = DETECTOR;
  const con = 0.4988 * Z;
  const ar = 0.602 / MW;
  const AC = con * ar;

  // Klein-Nishina Compton cross section calculation
  const A = energy / 511; // Energy in units of electron rest mass
  const C1 = (1 + A) / (A * A);
  const C2 = 2 * (1 + A) / (1 + 2 * A);
  const C3 = Math.log(1 + 2 * A) / A;
  const C4 = Math.log(1 + 2 * A) / (2 * A);
  const C5 = (1 + 3 * A) / Math.pow(1 + 2 * A, 2);
  const CC = AC * C1 * (C2 - C3) + C4 - C5;

  // Photoelectric cross section (empirical approximation)
  const PE = 1050 * Math.pow(1 / energy, 2.75);

  const TOT = CC + PE;

  // Macroscopic cross sections
  const UC = CC * DENS;
  const UP = PE * DENS;
  const UT = TOT * DENS;

  return {
    compton: UC,
    photoelectric: UP,
    total: UT,
    comptonFraction: UC / UT,
    photoFraction: UP / UT,
  };
}

/**
 * Calculate path length using Von Neumann rejection sampling
 * Based on exponential distribution with total cross section
 */
export function calculatePathLength(totalCrossSection: number): number {
  while (true) {
    const F = 10000 * Math.random();
    const A = Math.exp(-F * totalCrossSection);
    if (Math.random() <= A) {
      return F;
    }
  }
}

/**
 * Klein-Nishina scattering angle distribution using rejection sampling
 * Returns scattering angle in radians
 */
export function kleinNishinaScatter(energy: number): number {
  const R0 = 1;
  const KE = energy / 511;

  while (true) {
    const scatTheta = Math.random() * PI;
    const TR = Math.random();

    const N1 = 1 - Math.cos(scatTheta);
    const N2 = 1 + Math.pow(Math.cos(scatTheta), 2);
    const SN1 = Math.pow(KE * N2, 2);
    const SN2 = N2 * (1 + KE * N1);
    const P1 = Math.pow(1 / (1 + KE * N1), 2);
    const P2 = N2 / 2;
    const P3 = 1 + SN1 / SN2;
    const R = Math.sin(PI - scatTheta) * Math.pow(R0, 2) * P1 * P2 * P3;

    if (TR < R) {
      return scatTheta;
    }
  }
}

/**
 * Calculate energy after Compton scatter
 */
export function comptonScatteredEnergy(initialEnergy: number, scatterAngle: number): number {
  return initialEnergy / (1 + (initialEnergy / 511) * (1 - Math.cos(PI - scatterAngle)));
}

/**
 * Apply detector resolution (Gaussian broadening)
 * Uses sum of 12 uniform randoms for central limit theorem approximation
 */
export function applyDetectorResolution(energy: number, resolution: number): number {
  const sigma = resolution * Math.sqrt(energy);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Math.random();
  }
  const variance = sum - 6; // Approximates standard normal
  return sigma * variance + energy;
}

/**
 * Simulate a single photon event
 * Returns the recorded energy (or null if absorbed)
 */
export function simulateEvent(params: SimulationParams): { energy: number; scatters: number } | null {
  let energy = emitPhoton();
  let x = 0;
  let y = 0;
  let theta = Math.random() * 2 * PI;
  let scatters = 0;

  while (true) {
    const crossSections = calculateCrossSections(energy);
    const pathLength = calculatePathLength(crossSections.total);

    // Update position
    x += pathLength * Math.cos(theta);
    y += pathLength * Math.sin(theta);

    // Check if photon escaped (detected)
    const distance = Math.sqrt(x * x + y * y);
    if (distance > 1) {
      // Photon escaped - record it
      const recordedEnergy = applyDetectorResolution(energy, params.detectorResolution);
      return { energy: recordedEnergy, scatters };
    }

    // Photon still inside - check for photoelectric absorption
    if (Math.random() < crossSections.photoFraction) {
      // Absorbed - start new event
      return null;
    }

    // Compton scatter
    const scatterAngle = kleinNishinaScatter(energy);
    energy = comptonScatteredEnergy(energy, scatterAngle);

    // If energy too low, absorbed
    if (energy < 2.5) {
      return null;
    }

    theta += scatterAngle;
    scatters++;
  }
}

/**
 * Record energy to spectrum
 */
export function recordToSpectrum(
  energy: number,
  spectrum: number[],
  channelWidth: number
): number {
  let channel = Math.floor(energy / channelWidth);
  if (channel < 0) channel = 0;
  if (channel >= spectrum.length) channel = spectrum.length - 1;
  spectrum[channel]++;
  return channel;
}

/**
 * Run batch of simulation events
 */
export function runSimulationBatch(
  state: SimulationState,
  params: SimulationParams,
  batchSize: number
): SimulationState {
  const newSpectrum = [...state.spectrum];
  const newScatterStats = [...state.scatterStats];
  let events = state.events;
  let maxChannel = state.maxChannel;

  for (let i = 0; i < batchSize && events < params.maxEvents; i++) {
    const result = simulateEvent(params);
    events++;

    if (result) {
      const channel = recordToSpectrum(result.energy, newSpectrum, params.channelWidth);
      if (channel > maxChannel) maxChannel = channel;
      
      if (result.scatters < newScatterStats.length) {
        newScatterStats[result.scatters]++;
      }
    }
  }

  return {
    spectrum: newSpectrum,
    events,
    scatterStats: newScatterStats,
    isRunning: events < params.maxEvents,
    maxChannel,
  };
}

/**
 * Initialize simulation state
 */
export function initializeSimulation(): SimulationState {
  return {
    spectrum: new Array(2048).fill(0),
    events: 0,
    scatterStats: new Array(10).fill(0),
    isRunning: false,
    maxChannel: 0,
  };
}

/**
 * Get energy for a channel
 */
export function channelToEnergy(channel: number, channelWidth: number): number {
  return channel * channelWidth;
}

/**
 * Get peak information from spectrum
 */
export function findPeaks(spectrum: number[], channelWidth: number, threshold: number = 5): Array<{ channel: number; energy: number; counts: number }> {
  const peaks: Array<{ channel: number; energy: number; counts: number }> = [];
  
  for (let i = 2; i < spectrum.length - 2; i++) {
    if (spectrum[i] > threshold &&
        spectrum[i] > spectrum[i-1] &&
        spectrum[i] > spectrum[i+1] &&
        spectrum[i] > spectrum[i-2] &&
        spectrum[i] > spectrum[i+2]) {
      peaks.push({
        channel: i,
        energy: channelToEnergy(i, channelWidth),
        counts: spectrum[i],
      });
    }
  }
  
  return peaks.sort((a, b) => b.counts - a.counts).slice(0, 10);
}
