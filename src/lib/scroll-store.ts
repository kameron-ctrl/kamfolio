/**
 * Zustand scroll store — single source of truth for scroll state (D-07 through D-10).
 *
 * All downstream components read from this store. R3F layers use getState() inside
 * useFrame to avoid React reconciler overhead at 60fps.
 *
 * Phase boundaries (D-09):
 *   vertical:    0–40%   raw scroll progress
 *   transition: 40–55%
 *   horizontal: 55–100%
 */
import { create } from "zustand";

export type ScrollPhase = "vertical" | "transition" | "horizontal";

export interface ScrollState {
  scrollY: number;
  velocity: number;
  displayVelocity: number; // lerped — downstream visual effects use this
  phase: ScrollPhase;
  progress: number; // 0–1 within the current phase zone
  set: (partial: Partial<Omit<ScrollState, "set" | "displayVelocity">>) => void;
}

const LERP_FACTOR = 0.15; // A3 from RESEARCH.md — tune during execution if needed

export const useScrollStore = create<ScrollState>((set, get) => ({
  scrollY: 0,
  velocity: 0,
  displayVelocity: 0,
  phase: "vertical",
  progress: 0,
  set: (partial) =>
    set((state) => ({
      ...partial,
      displayVelocity:
        state.displayVelocity +
        ((partial.velocity ?? state.velocity) - state.displayVelocity) *
          LERP_FACTOR,
    })),
}));

/**
 * Pure helper — computes phase and within-zone progress from a raw [0, 1] scroll
 * fraction. Exported separately so it can be unit-tested without a DOM or store.
 */
export function computePhase(rawProgress: number): {
  phase: ScrollPhase;
  progress: number;
} {
  const clamped = Math.min(1, Math.max(0, rawProgress));
  // clamp01 + round to 10 decimal places to avoid IEEE 754 edge cases like
  // (0.45 / 0.45) === 0.9999999999999999 instead of exactly 1.
  const clamp01 = (v: number) =>
    Math.min(1, Math.max(0, Math.round(v * 1e10) / 1e10));

  if (clamped < 0.4) {
    return { phase: "vertical", progress: clamp01(clamped / 0.4) };
  }
  if (clamped < 0.55) {
    return { phase: "transition", progress: clamp01((clamped - 0.4) / 0.15) };
  }
  return { phase: "horizontal", progress: clamp01((clamped - 0.55) / 0.45) };
}
