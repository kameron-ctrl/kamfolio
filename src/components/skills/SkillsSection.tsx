"use client";

/**
 * Skills — docs/specs/about-skills-involvement. An editorial list: one
 * hairline-ruled row per group, items inline. No bars, percentages or logos.
 */
import { useRef } from "react";
import { useStaggerReveal } from "@/hooks/useScrollReveal";
import { SKILLS } from "@/content/about";
import { MONO_LABEL, SANS } from "@/components/ui/classes";
import SectionHeading from "@/components/ui/SectionHeading";

const STAGGER_S = 0.08;

export default function SkillsSection(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  useStaggerReveal(sectionRef, STAGGER_S);

  return (
    <section ref={sectionRef} aria-labelledby="skills-heading" className="px-4 py-16 md:px-[8vw] md:py-[16vh]">
      <SectionHeading id="skills-heading" kicker="Skills" title="The toolkit" />

      <dl className="mt-12">
        {SKILLS.map((group) => (
          <div
            key={group.group}
            data-reveal
            className="group border-t border-[var(--color-hairline)] py-7 last:border-b md:grid md:grid-cols-[220px_1fr] md:items-baseline"
          >
            <dt
              className={`${MONO_LABEL} transition-[color,transform] duration-150 motion-reduce:transition-none md:group-hover:translate-x-1 md:group-hover:text-[var(--color-silver)]`}
            >
              {group.group}
            </dt>
            <dd
              className={`${SANS} mt-3 flex flex-wrap text-lg leading-[1.5] text-[var(--color-silver)] md:mt-0 md:text-[clamp(18px,1.6vw,24px)]`}
            >
              {/* Each separator rides on the end of the item before it, so rows wrap between items */}
              {group.items.map((item, i) => (
                <span key={item} className="whitespace-nowrap">
                  {item}
                  {i < group.items.length - 1 && (
                    <span aria-hidden="true" className="mx-[0.6em] text-[var(--color-text-muted)]">
                      ·
                    </span>
                  )}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
