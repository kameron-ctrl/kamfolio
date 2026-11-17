/**
 * Hide-on-scroll-down / show-on-scroll-up logic for the contact bar.
 * Pure so it can be tested without a DOM.
 */

/** Above this scroll depth the bar always shows. */
export const BAR_ALWAYS_SHOWN_PX = 120;
/** Scroll movement smaller than this is treated as jitter (trackpads, Lenis easing tails). */
export const BAR_DIRECTION_DELTA_PX = 12;

export interface BarState {
  hidden: boolean;
  /** The scroll position the last direction change was measured from. */
  anchorY: number;
}

/** Next bar state for a new scroll position. Returns `prev` itself for jitter. */
export function nextBarState(prev: BarState, scrollY: number): BarState {
  if (scrollY < BAR_ALWAYS_SHOWN_PX) return { hidden: false, anchorY: scrollY };
  const delta = scrollY - prev.anchorY;
  if (Math.abs(delta) < BAR_DIRECTION_DELTA_PX) return prev;
  return { hidden: delta > 0, anchorY: scrollY };
}
