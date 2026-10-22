"use client";

/**
 * Lenis + GSAP wiring hub (D-04, D-05, D-06).
 *
 * Owns the 5-step init order:
 *   1. new Lenis({ autoRaf: false })
 *   2. lenis.on('scroll', ScrollTrigger.update)  ← bridge BEFORE any triggers
 *   3. gsap.ticker.add(time => lenis.raf(time * 1000))
 *   4. gsap.ticker.lagSmoothing(0)
 *   5. Register ScrollTriggers (Plan 04 components do this via useGSAP)
 *
 * Plus a 6th wiring: write scroll state to Zustand on every Lenis scroll event.
 *
 * Mounted once in app/layout.tsx — that file remains a Server Component.
 */
import { useLayoutEffect, useRef } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap, { ScrollTrigger } from "@/lib/gsap";
import { useScrollStore, pageProgress } from "@/lib/scroll-store";

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const lenisRef = useRef<Lenis | null>(null);

  useLayoutEffect(() => {
    // Register GSAP plugin here (client-only) — never at module scope (SSR crash).
    // See CLAUDE.md: "GSAP plugins must be registered inside useEffect."
    gsap.registerPlugin(ScrollTrigger);

    // Step 1: Create Lenis with autoRaf:false (Pitfall 1 — prevents double RAF)
    const lenis = new Lenis({
      duration: 1.2,
      lerp: 0.1,
      syncTouch: true,
      autoRaf: false,
    });
    lenisRef.current = lenis;

    // Step 2: Bridge Lenis → ScrollTrigger BEFORE any triggers exist (Pitfall 2)
    lenis.on("scroll", ScrollTrigger.update);

    // Step 3: Drive Lenis from GSAP ticker (single RAF loop)
    const tickerFn = (time: number): void => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);

    // Step 4: Disable lag smoothing — prevents drift on slow/throttled frames
    gsap.ticker.lagSmoothing(0);

    // Step 5: Step 5 (registering ScrollTriggers) happens in downstream
    // components via useGSAP (project cards, talks, Strikers, journey).

    // Step 6: Write scroll state to Zustand on every Lenis tick (D-08, D-09)
    // Named reference required so we can remove it explicitly in cleanup.
    // React 18 StrictMode double-invokes useLayoutEffect; an anonymous handler
    // would accumulate on each remount causing duplicate Zustand writes.
    const onScrollState = (lenisInstance: Lenis): void => {
      const total = document.body.scrollHeight - window.innerHeight;
      if (process.env.NODE_ENV === "development" && total <= 0) {
        console.warn(
          "[LenisProvider] document.body.scrollHeight <= window.innerHeight — phase tracking disabled. Check layout min-heights."
        );
      }

      // velocity MUST always be included here — omitting it causes displayVelocity
      // to lerp toward stale stored velocity rather than the current scroll velocity.
      // See scroll-store.ts: set() lerps displayVelocity using (partial.velocity ?? state.velocity).
      useScrollStore.getState().set({
        scrollY: lenisInstance.animatedScroll,
        velocity: lenisInstance.velocity, // required — drives displayVelocity lerp
        phase: "vertical", // the whole page scrolls vertically
        progress: pageProgress(lenisInstance.animatedScroll, total),
      });
    };
    lenis.on("scroll", onScrollState);

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      lenis.off("scroll", onScrollState);
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
