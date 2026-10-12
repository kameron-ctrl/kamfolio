"use client";

/**
 * Strikers Dance Troupe (PERS-03, PERS-04) — docs/specs/personality-timeline.
 * Bold editorial title block beside the scroll-driven silhouette formation.
 */
import { useRef } from "react";
import { STRIKERS } from "@/content/about";
import { SANS } from "@/components/ui/classes";
import StrikersFormation from "./StrikersFormation";

export default function StrikersPanel(): JSX.Element {
  const panelRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={panelRef}
      aria-labelledby="strikers-heading"
      className="flex flex-col px-4 py-16 md:min-h-screen md:flex-row md:items-center md:px-0 md:py-[10vh]"
    >
      <div className="md:w-[45%] md:pl-[8vw]">
        <p className="font-[family-name:var(--font-geist-mono)] text-sm uppercase tracking-[0.24em] text-[var(--color-nebula-coral)]">
          {STRIKERS.kicker}
        </p>
        <h2
          id="strikers-heading"
          className={`${SANS} mt-4 text-[44px] font-extrabold leading-[0.92] tracking-[-0.04em] text-[var(--color-silver)] md:text-[88px]`}
        >
          {STRIKERS.title}
        </h2>
        <p className={`${SANS} mt-6 max-w-[44ch] text-base leading-[1.55] text-[var(--color-text-muted)]`}>
          {STRIKERS.line}
        </p>
      </div>
      <div className="mt-10 flex justify-center md:mt-0 md:w-[55%]">
        <StrikersFormation panelRef={panelRef} />
      </div>
    </section>
  );
}
