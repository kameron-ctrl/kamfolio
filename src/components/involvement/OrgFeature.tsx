"use client";

/**
 * One campus organization, Strikers-style — docs/specs/about-skills-involvement.
 * Bold editorial title block beside a visual (Strikers: the scroll-driven dancer
 * formation; others: their lead photo), then the rest of the photos. Sides
 * alternate by index for rhythm; with no visual the title block stands alone.
 */
import { useRef } from "react";
import Image from "next/image";
import { useStaggerReveal } from "@/hooks/useScrollReveal";
import type { Organization } from "@/content/about";
import { MONO_LABEL, SANS, TEXT_LINK } from "@/components/ui/classes";
import StrikersFormation from "@/components/strikers/StrikersFormation";
import OrgGallery from "./OrgGallery";

const STAGGER_S = 0.1;

export default function OrgFeature({ org, index }: { org: Organization; index: number }): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  useStaggerReveal(sectionRef, STAGGER_S);

  const headingId = `org-${org.id}`;
  const lead = org.visual === "photo" ? org.photos[0] : undefined;
  const gallery = lead ? org.photos.slice(1) : org.photos;
  const hasVisual = org.visual === "formation" || Boolean(lead);
  // Alternate sides only when there's a visual to alternate with
  const reversed = hasVisual && index % 2 === 1;

  return (
    <section ref={sectionRef} aria-labelledby={headingId}>
      <div
        ref={rowRef}
        className={`flex flex-col px-4 py-16 md:items-center md:gap-[4vw] md:px-[8vw] ${
          hasVisual ? "md:min-h-[80vh] md:py-[10vh]" : "md:py-[12vh]"
        } ${reversed ? "md:flex-row-reverse" : "md:flex-row"}`}
      >
        <div data-reveal className={hasVisual ? "md:w-[42%] md:shrink-0" : "md:max-w-[60%]"}>
          <p className="font-[family-name:var(--font-geist-mono)] text-sm uppercase tracking-[0.24em] text-[var(--color-nebula-coral)]">
            {org.kicker}
          </p>
          <h3
            id={headingId}
            className={`${SANS} mt-4 text-[44px] font-extrabold leading-[0.92] tracking-[-0.04em] text-[var(--color-silver)] md:text-[clamp(56px,6vw,88px)]`}
          >
            {org.name}
          </h3>
          <p className={`${SANS} mt-6 max-w-[44ch] text-base leading-[1.55] text-[var(--color-text-muted)]`}>
            {org.line}
          </p>
          {org.meta && <p className={`${MONO_LABEL} mt-4`}>{org.meta}</p>}
          {org.link && (
            <a
              href={org.link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${org.link.label} (opens in a new tab)`}
              className={`${TEXT_LINK} mt-6 inline-block`}
            >
              {org.link.label} ↗
            </a>
          )}
        </div>

        {org.visual === "formation" && (
          <div className="mt-10 flex justify-center md:mt-0 md:flex-1">
            <StrikersFormation panelRef={rowRef} />
          </div>
        )}

        {lead && (
          <figure data-reveal className="mt-10 flex flex-col items-center md:mt-0 md:flex-1">
            <div className="relative aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded border border-[var(--color-hairline)]">
              <Image src={lead.src} alt={lead.alt} fill sizes="(min-width: 768px) 420px, 100vw" className="object-cover" />
            </div>
            <figcaption className={`${MONO_LABEL} mt-3 w-full max-w-[420px]`}>{org.caption}</figcaption>
          </figure>
        )}
      </div>

      {gallery.length > 0 && (
        <OrgGallery photos={gallery} caption={lead ? undefined : org.caption} label={`${org.name} photos`} />
      )}
    </section>
  );
}
