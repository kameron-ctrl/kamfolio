"use client";

/**
 * HorizontalTrack — GSAP pin + scrub (D-11, D-12, FOUND-02, FOUND-04).
 *
 * Pins the OUTER <section> and animates the INNER track's `x` as the user
 * scrolls vertically through the trigger zone. Per RESEARCH.md Pattern 4:
 *   "don't animate the pinned element itself because that will throw off
 *    the measurements." The section is pinned; the track moves.
 *
 * StrictMode safety (D-05, Pitfall 3): ScrollTrigger registration runs
 * inside `useGSAP` from @gsap/react, which wraps gsap.context() and
 * auto-reverts on the second StrictMode invoke without leaking triggers.
 *
 * Lenis sync (FOUND-04): this trigger is created AFTER LenisProvider has
 * called `lenis.on('scroll', ScrollTrigger.update)` (LenisProvider mounts
 * higher in the tree and runs its useLayoutEffect before this client
 * component's useGSAP). That bridge means the trigger fires at Lenis's
 * `animatedScroll` offsets, not native window.scrollY.
 *
 * Phase 5 reminder (Pitfall 6): if any pin trigger is killed (e.g., when
 * cards are conditionally remounted), call `ScrollTrigger.refresh()`
 * afterward to clear the pinSpacer blank-space artifact. Phase 1 never
 * kills this trigger, so the issue does not manifest here.
 */
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap, { ScrollTrigger } from "@/lib/gsap";

export default function HorizontalTrack({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      // Compute horizontal travel as a function so it re-evaluates on resize
      const getDistance = (): number => track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: () => -getDistance(),
        ease: "none", // REQUIRED for scrub — must be linear
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 1, // A2 — tunable; 1s catch-up matches Lenis smoothing
          anticipatePin: 1, // A4 — tunable; reduces jitter at pin entry
          invalidateOnRefresh: true, // recalculates x on window resize
          markers: process.env.NODE_ENV === "development",
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      style={{ overflow: "hidden" }}
      data-testid="horizontal-track-section"
    >
      <div
        ref={trackRef}
        style={{
          display: "flex",
          width: "max-content",
          willChange: "transform",
        }}
        data-testid="horizontal-track-inner"
      >
        {children}
      </div>
    </section>
  );
}
