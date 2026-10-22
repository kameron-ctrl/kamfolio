"use client";

/**
 * Journey timeline (PERS-05, PERS-06) — docs/specs/personality-timeline.
 * A vertical spine: centered on desktop with entries alternating left/right,
 * at 28px on mobile with text to the right. The silver progress line fills
 * with scroll; the planet nearest the viewport's vertical center is active.
 */
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap, { ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/reduced-motion";
import { JOURNEY } from "@/content/about";
import { MONO_LABEL, SANS } from "@/components/ui/classes";
import { pickActiveNode } from "./active-node";

const ACTIVE_RADIUS_PX = 180;
const NONE = -1;

export default function JourneyTimeline(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const planetRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const activeRef = useRef<number>(NONE);
  const [active, setActive] = useState<number>(NONE);
  const [isStatic, setIsStatic] = useState<boolean>(false);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const spine = spineRef.current;
      if (!spine) return;
      if (prefersReducedMotion()) {
        setIsStatic(true);
        return;
      }

      gsap.fromTo(
        progressRef.current,
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: spine, start: "top center", end: "bottom center", scrub: true } }
      );

      // Measured every frame while on screen: Lenis keeps easing after the
      // wheel stops, so scroll events alone would leave the active node stale.
      const tick = (): void => {
        const centers = planetRefs.current.map((el) => {
          const r = el?.getBoundingClientRect();
          return r ? r.top + r.height / 2 : Infinity;
        });
        const next = pickActiveNode(centers, window.innerHeight / 2, ACTIVE_RADIUS_PX);
        if (next !== activeRef.current) {
          activeRef.current = next;
          setActive(next);
        }
      };

      ScrollTrigger.create({
        trigger: spine,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          if (self.isActive) gsap.ticker.add(tick);
          else gsap.ticker.remove(tick);
        },
      });

      return () => gsap.ticker.remove(tick);
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} aria-labelledby="journey-heading" className="px-4 py-16 md:px-[8vw] md:py-[16vh]">
      <h2 id="journey-heading" className={MONO_LABEL}>
        The journey
      </h2>

      <div ref={spineRef} className="relative mt-12 md:mx-auto md:mt-20 md:max-w-[1040px]">
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-[28px] top-0 w-px bg-[var(--color-hairline)] md:left-1/2"
        />
        <div
          ref={progressRef}
          aria-hidden="true"
          className={`absolute bottom-0 left-[28px] top-0 w-px origin-top bg-[var(--color-silver)] md:left-1/2 ${
            isStatic ? "" : "scale-y-0"
          }`}
        />

        <ol className="pl-[64px] md:pl-0">
          {JOURNEY.map((node, i) => {
            const isActive = isStatic || active === i;
            const pulses = isActive && !isStatic;
            const leftSide = i % 2 === 0;
            return (
              <li
                key={node.id}
                className={`relative min-h-[96px] pb-10 transition-opacity duration-300 motion-reduce:transition-none md:grid md:min-h-[200px] md:grid-cols-[1fr_44px_1fr] md:gap-x-12 md:pb-0 ${
                  isActive ? "opacity-100" : "opacity-[0.55]"
                }`}
              >
                <span
                  ref={(el) => {
                    planetRefs.current[i] = el;
                  }}
                  aria-hidden="true"
                  className="absolute -left-[58px] top-0 h-[44px] w-[44px] md:relative md:left-auto md:col-start-2 md:row-start-1"
                >
                  {pulses && node.planet && (
                    <span className="absolute inset-0 animate-orbit-pulse rounded-full border border-[var(--color-silver)]" />
                  )}
                  <span
                    className={`absolute inset-0 rounded-full transition-transform duration-300 motion-reduce:transition-none ${
                      node.planet ? "" : "border border-dashed border-[var(--color-silver)]"
                    } ${pulses ? "scale-[1.12]" : ""}`}
                    style={node.planet ? { background: node.planet } : undefined}
                  />
                </span>

                <div
                  className={`md:row-start-1 md:pt-1 ${
                    leftSide ? "md:col-start-1 md:text-right" : "md:col-start-3"
                  }`}
                >
                  <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                    {node.dates}
                  </p>
                  <h3 className={`${SANS} mt-1 text-xl font-semibold text-[var(--color-silver)]`}>{node.title}</h3>
                  <p className={`${SANS} mt-1 text-[13px] text-[var(--color-text-muted)]`}>{node.role}</p>
                  <p
                    className={`${SANS} mt-2 max-w-[38ch] text-sm leading-snug text-[var(--color-text-body)] ${
                      leftSide ? "md:ml-auto" : ""
                    }`}
                  >
                    {node.line}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
