"use client";

import { createContext, useContext } from "react";

/**
 * What children of HorizontalTrack need to build their own ScrollTriggers:
 *   - "pending":    layout not decided yet (before matchMedia runs) — build nothing
 *   - "horizontal": desktop pin; pass `tween` as ScrollTrigger `containerAnimation`
 *   - "vertical":   mobile stack; use plain vertical triggers
 */
export type TrackMode = "pending" | "horizontal" | "vertical";

export interface TrackContextValue {
  mode: TrackMode;
  tween: gsap.core.Tween | null;
}

export const TrackContext = createContext<TrackContextValue>({ mode: "pending", tween: null });

export function useTrack(): TrackContextValue {
  return useContext(TrackContext);
}
