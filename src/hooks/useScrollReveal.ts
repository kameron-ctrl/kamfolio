"use client";

/**
 * Fires `onReveal` once when `ref` scrolls past `start` (a ScrollTrigger start,
 * e.g. "top 75%"). Under reduced motion it fires immediately with `instant = true`
 * and `onArm` never runs, so content is never left hidden.
 */
import type { RefObject } from "react";
import { useGSAP } from "@gsap/react";
import gsap, { ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/reduced-motion";

interface RevealOptions {
  start: string;
  /** Set the hidden "before" state. */
  onArm?: () => void;
  /** Play the entrance. `instant` is true under reduced motion. */
  onReveal: (instant: boolean) => void;
}

export function useScrollReveal(ref: RefObject<HTMLElement>, { start, onArm, onReveal }: RevealOptions): void {
  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        onReveal(true);
        return;
      }
      onArm?.();
      ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => onReveal(false) });
    },
    { scope: ref }
  );
}

const STAGGER_ENTRANCE = { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" } as const;

/**
 * Fades + lifts every `[data-reveal]` inside `ref` in order, `staggerS` apart,
 * once the section top crosses 75% of the viewport. Static under reduced motion.
 */
export function useStaggerReveal(ref: RefObject<HTMLElement>, staggerS: number): void {
  const items = (): HTMLElement[] =>
    ref.current ? gsap.utils.toArray<HTMLElement>("[data-reveal]", ref.current) : [];
  useScrollReveal(ref, {
    start: "top 75%",
    onArm: () => gsap.set(items(), { opacity: 0, y: 16 }),
    onReveal: (instant) => {
      if (!instant) gsap.to(items(), { ...STAGGER_ENTRANCE, stagger: staggerS });
    },
  });
}
