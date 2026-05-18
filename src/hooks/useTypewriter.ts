/**
 * useTypewriter — steps through `text` one character at a time at `charDelayMs`
 * intervals, returning the currently-displayed substring.
 *
 * @param text - The full string to type out.
 * @param charDelayMs - Milliseconds between each character reveal.
 * @param startSignal - When false the hook returns "" immediately (no flash of
 *   pre-rendered text during SSR hydration or before the triggering animation
 *   completes). When true the interval starts.
 * @returns The currently-displayed portion of `text`.
 *
 * QUAL-03 reduced-motion path (D-12): when `window.matchMedia("(prefers-reduced-motion:
 * reduce)").matches` is true and `startSignal` is true, the full text is returned
 * immediately without any timer.
 *
 * SSR guard: `window.matchMedia` is read inside the `useEffect` body, never at
 * module scope, to prevent crashes during Next.js server render.
 *
 * D-12 reference: cursor character and cursor-fade state live in HeroOverlay.tsx,
 * not in this hook.
 */
import { useState, useEffect, useRef } from "react";

export function useTypewriter(
  text: string,
  charDelayMs: number,
  startSignal: boolean
): string {
  const [displayed, setDisplayed] = useState<string>("");
  const indexRef = useRef<number>(0);

  useEffect(() => {
    // Guard 1: no signal — clear and do nothing
    if (!startSignal) {
      setDisplayed("");
      return;
    }

    // Guard 2: read reducedMotion inside effect body (NOT at module scope — SSR guard required)
    const reducedMotion: boolean =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    // Guard 3: reduced-motion fast-path — show full text immediately, no timer
    if (reducedMotion) {
      setDisplayed(text);
      return;
    }

    // Reset before starting interval — prevents React 18 Strict Mode double-invoke
    // from starting the second interval mid-string
    indexRef.current = 0;
    setDisplayed("");

    const id: ReturnType<typeof setInterval> = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        clearInterval(id);
      }
    }, charDelayMs);

    return () => clearInterval(id);
  }, [startSignal, text, charDelayMs]);

  return displayed;
}
