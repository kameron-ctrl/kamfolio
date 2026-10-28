"use client";

import { useRef } from "react";
import Image from "next/image";
import { CONFERENCE } from "@/content/conference";
import { useStaggerReveal } from "@/hooks/useScrollReveal";
import { MONO, MONO_LABEL, SANS, TEXT_LINK } from "@/components/ui/classes";

export default function ConferenceSection(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  useStaggerReveal(sectionRef, 0.1);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="conference-heading"
      className="px-4 py-16 md:px-[8vw] md:py-[12vh]"
    >
      <h2 id="conference-heading" className={MONO_LABEL}>
        In the open source community
      </h2>
      <div className="mt-8 grid gap-10 md:mt-12 md:grid-cols-2 md:gap-[4vw]">
        <article data-reveal aria-labelledby="conference-title">
          <p className={`${MONO} text-[var(--color-nebula-teal)]`}>{CONFERENCE.meta}</p>
          <h3
            id="conference-title"
            className={`${SANS} mt-5 text-2xl font-semibold leading-[1.1] text-[var(--color-silver)] md:text-[32px]`}
          >
            {CONFERENCE.title}
          </h3>
          <p className={`${SANS} mt-5 max-w-[52ch] text-base leading-[1.55] text-[var(--color-text-body)]`}>
            {CONFERENCE.intro}
          </p>
          <p className={`${SANS} mt-4 max-w-[52ch] text-base leading-[1.55] text-[var(--color-text-body)]`}>
            {CONFERENCE.reflection}
          </p>
          <div className="mt-8 border-l-2 border-[var(--color-nebula-coral)] pl-5">
            <h4 className={`${MONO_LABEL} text-[var(--color-nebula-coral)]`}>A closer look · NetBird</h4>
            <p className={`${SANS} mt-3 max-w-[48ch] text-base leading-[1.55] text-[var(--color-text-body)]`}>
              {CONFERENCE.takeaway}
            </p>
            <a
              href="https://docs.netbird.io/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Explore NetBird (opens in a new tab)"
              className={`${TEXT_LINK} mt-4 inline-block`}
            >
              Explore NetBird ↗
            </a>
          </div>
        </article>
        <figure data-reveal className="min-w-0">
          <div className="grid grid-cols-2 items-start gap-3">
            {CONFERENCE.photos.map((photo) => (
              <Image
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(min-width: 768px) 20vw, 50vw"
                className="h-auto w-full rounded border border-[var(--color-hairline)]"
              />
            ))}
          </div>
          <figcaption className={`${MONO_LABEL} mt-4`}>Scenes from All Things Open · Raleigh, NC · 2026</figcaption>
        </figure>
      </div>
    </section>
  );
}
