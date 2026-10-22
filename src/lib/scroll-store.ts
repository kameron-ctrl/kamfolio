/**
 * Zustand scroll store — single source of truth for scroll state (D-07 through D-10).
 *
 * All downstream components read from this store. R3F layers use getState() inside
 * useFrame to avoid React reconciler overhead at 60fps.
 *
 * The page scrolls vertically end to end (Oct 2026: horizontal track removed),
 * so `phase` stays "vertical" and `progress` is the whole-page fraction. The
 * other phase names remain in the type only because NebulaScene still branches
 * on them.
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

/** Whole-page scroll fraction in [0, 1]; 0 when the page can't scroll. */
export function pageProgress(scrollY: number, scrollable: number): number {
  if (scrollable <= 0) return 0;
  return Math.min(1, Math.max(0, scrollY / scrollable));
}
