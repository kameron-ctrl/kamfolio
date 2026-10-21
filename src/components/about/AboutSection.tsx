"use client";

/** About — docs/specs/about-skills-involvement. Kameron's own words, verbatim. */
import { useRef } from "react";
import { useStaggerReveal } from "@/hooks/useScrollReveal";
import { ABOUT } from "@/content/about";
import { MONO_LABEL, SANS } from "@/components/ui/classes";

const STAGGER_S = 0.1;

export default function AboutSection(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  useStaggerReveal(sectionRef, STAGGER_S);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="about-heading"
      className="px-4 py-16 md:grid md:grid-cols-12 md:gap-8 md:px-[8vw] md:py-[16vh]"
    >
      <div data-reveal className="md:col-span-4">
        <h2 id="about-heading" className={MONO_LABEL}>
          About
        </h2>
        <dl className="mt-6 max-w-[320px] border-t border-[var(--color-hairline)]">
          {ABOUT.facts.map((fact) => (
            <div key={fact.label} className="border-b border-[var(--color-hairline)] py-3">
              <dt className={MONO_LABEL}>{fact.label}</dt>
              <dd className={`${SANS} mt-1 text-[15px] text-[var(--color-silver)]`}>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-10 md:col-span-8 md:mt-0">
        <p
          data-reveal
          className={`${SANS} max-w-[30ch] text-[clamp(26px,2.6vw,40px)] font-medium leading-[1.25] tracking-[-0.015em] text-[var(--color-silver)]`}
        >
          {ABOUT.lead}
        </p>
        <p data-reveal className={`${SANS} mt-8 max-w-[60ch] text-lg leading-[1.65] text-[var(--color-text-body)]`}>
          {ABOUT.body}
        </p>
      </div>
    </section>
  );
}
