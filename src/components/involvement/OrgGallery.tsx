"use client";

/**
 * An organization's photo row — docs/specs/about-skills-involvement.
 * Desktop: up to 4 staggered portrait columns (more photos wrap) that drift
 * vertically at alternating rates while scrolling past. Mobile: a full-width stack.
 */
import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap, { ScrollTrigger } from "@/lib/gsap";
import { DESKTOP_QUERY, prefersReducedMotion } from "@/lib/reduced-motion";
import type { Photo } from "@/content/about";
import { MONO_LABEL } from "@/components/ui/classes";

/** Total vertical drift (px) per frame across the row's trip through the viewport. */
const DRIFT_PX = [60, 140] as const;

/** Literal class names so Tailwind can see them. */
const COLUMNS: Record<number, string> = {
  1: "md:grid-cols-1 md:max-w-[34vw]",
  2: "md:grid-cols-2 md:max-w-[56vw]",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

interface OrgGalleryProps {
  photos: readonly Photo[];
  /** Shown under the first frame. */
  caption?: string;
  label: string;
}

export default function OrgGallery({ photos, caption, label }: OrgGalleryProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const row = ref.current;
      if (!row || prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add(DESKTOP_QUERY, () => {
        gsap.utils.toArray<HTMLElement>("[data-frame]", row).forEach((frame, i) => {
          const drift = DRIFT_PX[i % DRIFT_PX.length];
          gsap.fromTo(
            frame,
            { y: drift / 2 },
            {
              y: -drift / 2,
              ease: "none",
              scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: true },
            }
          );
        });
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      className={`grid grid-cols-1 gap-4 px-4 pb-16 md:items-start md:gap-[2.5vw] md:px-[8vw] md:pb-[16vh] ${
        COLUMNS[Math.min(photos.length, 4)]
      }`}
    >
      {photos.map((photo, i) => (
        <figure key={photo.src} data-frame className={i % 2 === 1 ? "md:mt-[14vh]" : ""}>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded border border-[var(--color-hairline)]">
            <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 768px) 22vw, 100vw" className="object-cover" />
          </div>
          {i === 0 && caption && <figcaption className={`${MONO_LABEL} mt-3`}>{caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}
