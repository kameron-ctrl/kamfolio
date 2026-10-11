/** SSR-safe `prefers-reduced-motion` check. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Below this width the horizontal track unpins and panels stack vertically. */
export const DESKTOP_QUERY = "(min-width: 768px)";
