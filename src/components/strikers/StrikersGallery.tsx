"use client";

/**
 * Strikers photo gallery — docs/specs/personality-timeline ("Gallery").
 * Desktop: four portrait frames in a staggered row; as the row scrolls past,
 * frames drift vertically at alternating rates for depth (transform only).
 * Mobile: frames stack full-width with no drift.
 */
import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap, { ScrollTrigger } from "@/lib/gsap";
import { DESKTOP_QUERY, prefersReducedMotion } from "@/lib/reduced-motion";
import { STRIKERS } from "@/content/about";
import { MONO_LABEL } from "@/components/ui/classes";

/** Total vertical drift (px) per frame across the row's trip through the viewport. */
const DRIFT_PX = [60, 140] as const;

export default function StrikersGallery(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const section = sectionRef.current;
      if (!section || prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add(DESKTOP_QUERY, () => {
        gsap.utils.toArray<HTMLElement>("[data-frame]", section).forEach((frame, i) => {
          const drift = DRIFT_PX[i % DRIFT_PX.length];
          gsap.fromTo(
            frame,
            { y: drift / 2 },
            {
              y: -drift / 2,
              ease: "none",
              scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true },
            }
          );
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Strikers Dance Troupe photos"
      className="grid grid-cols-1 gap-4 px-4 pb-16 md:grid-cols-4 md:items-start md:gap-[2.5vw] md:px-[8vw] md:pb-[16vh]"
    >
      {STRIKERS.photos.map((photo, i) => (
        <figure key={photo.src} data-frame className={i % 2 === 1 ? "md:mt-[14vh]" : ""}>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded border border-[var(--color-hairline)]">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 768px) 22vw, 100vw"
              className="object-cover"
            />
          </div>
          {i === 0 && <figcaption className={`${MONO_LABEL} mt-3`}>{STRIKERS.caption}</figcaption>}
        </figure>
      ))}
    </section>
  );
}
