"use client";

/**
 * HorizontalTrack — GSAP pin + scrub (D-11, D-12, FOUND-02, FOUND-04).
 *
 * Pins the OUTER <section> and animates the INNER track's `x` as the user
 * scrolls vertically through the trigger zone. Per RESEARCH.md Pattern 4:
 *   "don't animate the pinned element itself because that will throw off
 *    the measurements." The section is pinned; the track moves.
 *
 * Desktop only (docs/specs/project-cards): under 768px gsap.matchMedia skips
 * the pin and the track stacks vertically via CSS.
 *
 * Children get the scrub tween through TrackContext so their own triggers can
 * use `containerAnimation`. The pin's start/end scroll positions are
 * published to the scroll store so phase/progress follow the real pin range.
 *
 * StrictMode safety (D-05, Pitfall 3): everything runs inside `useGSAP`,
 * which reverts the matchMedia (and its tween + trigger) on unmount.
 *
 * Lenis sync (FOUND-04): LenisProvider bridges `lenis.on('scroll',
 * ScrollTrigger.update)`, so this trigger fires at Lenis offsets.
 */
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap, { ScrollTrigger } from "@/lib/gsap";
import { setTrackRange } from "@/lib/scroll-store";
import { DESKTOP_QUERY } from "@/lib/reduced-motion";
import { TrackContext, type TrackContextValue } from "./track-context";

export default function HorizontalTrack({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [track, setTrack] = useState<TrackContextValue>({ mode: "pending", tween: null });

  useGSAP(
    () => {
      // Register here too: React fires child useLayoutEffect before parent,
      // so LenisProvider's registration hasn't run yet when this callback fires.
      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      const trackEl = trackRef.current;
      if (!section || !trackEl) return;

      const mm = gsap.matchMedia();

      mm.add(DESKTOP_QUERY, () => {
        // Re-evaluated on refresh so resize recomputes the travel
        const getDistance = (): number => trackEl.scrollWidth - window.innerWidth;

        const tween = gsap.to(trackEl, {
          x: () => -getDistance(),
          ease: "none", // REQUIRED for scrub — must be linear
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${getDistance()}`,
            pin: true,
            scrub: 1, // 1s catch-up matches Lenis smoothing
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: (self) => setTrackRange({ start: self.start, end: self.end }),
          },
        });

        const st = tween.scrollTrigger;
        if (st) setTrackRange({ start: st.start, end: st.end });
        setTrack({ mode: "horizontal", tween });

        return () => {
          setTrackRange(null);
          setTrack({ mode: "pending", tween: null });
        };
      });

      mm.add(`not ${DESKTOP_QUERY}`, () => {
        setTrack({ mode: "vertical", tween: null });
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <TrackContext.Provider value={track}>
      <section
        ref={sectionRef}
        className="relative overflow-hidden"
        data-testid="horizontal-track-section"
      >
        <div
          ref={trackRef}
          className="flex flex-col md:w-max md:flex-row md:[will-change:transform]"
          data-testid="horizontal-track-inner"
        >
          {children}
        </div>
      </section>
    </TrackContext.Provider>
  );
}
