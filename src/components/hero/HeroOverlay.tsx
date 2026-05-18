"use client";

import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "@/lib/gsap";
import { useTypewriter } from "@/hooks/useTypewriter";

/**
 * HeroOverlay — fixed bottom-left name + subtitle overlay with GSAP fade-in and typewriter effect.
 *
 * Phase 4 scope:
 *   - HERO-06: Kameron's name fades from opacity 0 → 1 via GSAP over NAME_FADE_DURATION seconds
 *              starting NAME_FADE_DELAY seconds after mount.
 *   - HERO-07: Subtitle types out character by character after name fade completes (onComplete gate).
 *   - HERO-08: GRAIN_OPACITY constant exported for unit testability (grain layer lives in globals.css).
 *
 * Reduced motion (QUAL-03): name appears at full opacity immediately; subtitle shows as full
 * text immediately (useTypewriter fast-path); cursor fade is instant via calc(var(--motion-ok) * 0s).
 *
 * StrictMode: useGSAP wraps gsap.context() — automatic cleanup on unmount, no manual killTweensOf needed.
 */

// Named constants — exported so HeroOverlay.constants.test.ts can assert ranges
export const NAME_FADE_DELAY = 1.3;       // seconds — D-05: must be in [1.2, 1.5]
export const NAME_FADE_DURATION = 1.8;    // seconds — D-06: must be in [1.5, 2.0]
export const GRAIN_OPACITY = 0.05;        // unitless — D-14: must be in [0.04, 0.07]
export const CURSOR_FADE_DELAY_MS = 2000; // milliseconds — D-11

const SUBTITLE_TEXT = "Full-stack developer & creative technologist";

/** SSR-safe reduced-motion check — follows established MoonScene.tsx pattern (lines 69–71). */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function HeroOverlay(): JSX.Element {
  const nameRef = useRef<HTMLHeadingElement>(null);
  const [typewriterReady, setTypewriterReady] = useState<boolean>(false);
  const [cursorFading, setCursorFading] = useState<boolean>(false);

  const reducedMotion = prefersReducedMotion();

  useGSAP(() => {
    if (reducedMotion) {
      // Skip animation entirely — name visible immediately, gate typewriter now
      setTypewriterReady(true);
      return;
    }
    gsap.fromTo(
      nameRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        duration: NAME_FADE_DURATION,
        delay: NAME_FADE_DELAY,
        ease: "power2.out",
        onComplete: () => setTypewriterReady(true),
      }
    );
  });

  const subtitle = useTypewriter(SUBTITLE_TEXT, 60, typewriterReady);

  const isTypingComplete =
    subtitle.length === SUBTITLE_TEXT.length && subtitle.length > 0;

  useEffect(() => {
    if (!isTypingComplete) return;
    const id = setTimeout(() => setCursorFading(true), CURSOR_FADE_DELAY_MS);
    return () => clearTimeout(id);
  }, [isTypingComplete]);

  return (
    <div
      data-testid="hero-overlay"
      style={{
        position: "fixed",
        bottom: "clamp(2rem, 4vh, 4rem)",
        left: "clamp(1.5rem, 4vw, 4rem)",
        zIndex: 2,
        pointerEvents: "none",
      }}
    >
      <h1
        ref={nameRef}
        data-testid="hero-name"
        style={{
          fontFamily: "var(--font-geist-sans)",
          fontWeight: 250,
          fontSize: "clamp(3rem, 5vw, 7rem)",
          letterSpacing: "0.2em",
          color: "#ffffff",
          lineHeight: 1,
          margin: 0,
          // Initial opacity set here (not only via GSAP) — prevents flash between React render
          // and GSAP initialization (RESEARCH.md Anti-Patterns, Pitfall 4).
          opacity: reducedMotion ? 1 : 0,
        }}
      >
        Kameron Benjamin
      </h1>
      <p
        data-testid="hero-subtitle"
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: "clamp(0.85rem, 1.2vw, 1.1rem)",
          letterSpacing: "0.08em",
          color: "rgba(255,255,255,0.75)",
          margin: 0,
          marginTop: "0.75rem",
        }}
      >
        {subtitle}
        {typewriterReady && (
          <span
            aria-hidden="true"
            style={{
              opacity: cursorFading ? 0 : 1,
              transition: "opacity calc(var(--motion-ok) * 0.6s) ease",
            }}
          >
            |
          </span>
        )}
      </p>
    </div>
  );
}
