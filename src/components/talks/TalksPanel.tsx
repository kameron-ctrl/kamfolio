"use client";

/**
 * Talks & writing (TALK-01) — docs/specs/talks.
 * The PyTorch Santa Cruz talk (with the slide viewer) and the PyTorch blog feature.
 */
import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "@/lib/gsap";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { DESKTOP_QUERY } from "@/lib/reduced-motion";
import { ARTICLE, SLIDES, TALK } from "@/content/about";
import { MONO, MONO_LABEL, SANS, TEXT_LINK } from "@/components/ui/classes";
import SlideViewer from "./SlideViewer";

const ENTRANCE = { duration: 0.6, ease: "expo.out" } as const;
const ENTRY_STAGGER = 0.12;
const DIVIDER_DURATION = 0.7;

const ENTRY_TITLE = `${SANS} mt-5 text-2xl font-semibold leading-[1.1] text-[var(--color-silver)] md:text-[32px]`;

export default function TalksPanel(): JSX.Element {
  const panelRef = useRef<HTMLElement>(null);
  const slidesButtonRef = useRef<HTMLButtonElement>(null);
  const [viewerOpen, setViewerOpen] = useState<boolean>(false);

  useScrollReveal(panelRef, {
    start: "top 75%",
    onArm: () => {
      const panel = panelRef.current;
      if (!panel) return;
      // Desktop: the entries sit side by side, split by a vertical hairline
      const sideBySide = window.matchMedia(DESKTOP_QUERY).matches;
      gsap.set(panel.querySelectorAll("[data-entry]"), { opacity: 0, y: 16 });
      gsap.set(panel.querySelector("[data-divider]"), sideBySide ? { scaleY: 0 } : { scaleX: 0 });
    },
    onReveal: (instant) => {
      const panel = panelRef.current;
      if (!panel || instant) return;
      gsap.to(panel.querySelectorAll("[data-entry]"), {
        ...ENTRANCE,
        opacity: 1,
        y: 0,
        stagger: window.matchMedia(DESKTOP_QUERY).matches ? ENTRY_STAGGER : 0,
      });
      gsap.to(panel.querySelector("[data-divider]"), {
        ...ENTRANCE,
        duration: DIVIDER_DURATION,
        scaleX: 1,
        scaleY: 1,
      });
    },
  });

  return (
    <section
      ref={panelRef}
      aria-labelledby="talks-heading"
      className="flex flex-col px-4 py-16 md:px-[8vw] md:py-[16vh]"
    >
      <h2 id="talks-heading" className={MONO_LABEL}>
        On stage &amp; in print
      </h2>

      <div className="mt-8 flex flex-col gap-12 md:mt-12 md:flex-row md:gap-[2vw]">
        <article data-entry aria-labelledby="talk-title" className="md:flex-1">
          <p className={`${MONO} text-[var(--color-nebula-teal)]`}>{TALK.meta}</p>
          <div className="relative mt-5 aspect-[16/10] w-full overflow-hidden rounded border border-[var(--color-hairline)] md:aspect-auto md:h-[28vh]">
            <Image
              src={TALK.photo.src}
              alt={TALK.photo.alt}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover object-[center_45%]"
            />
          </div>
          <h3 id="talk-title" className={ENTRY_TITLE}>
            {TALK.title}
          </h3>
          <p className={`${SANS} mt-3 max-w-[44ch] text-base leading-[1.55] text-[var(--color-text-body)]`}>{TALK.line}</p>
          <button
            ref={slidesButtonRef}
            type="button"
            onClick={() => setViewerOpen(true)}
            className={`${TEXT_LINK} mt-5`}
          >
            View slides ({SLIDES.length})
          </button>
        </article>

        <div
          data-divider
          aria-hidden="true"
          className="h-px w-full origin-left bg-[var(--color-hairline)] md:h-auto md:w-px md:self-stretch md:origin-top"
        />

        <article data-entry aria-labelledby="article-title" className="md:flex-1">
          <p className={`${MONO} text-[var(--color-nebula-coral)]`}>{ARTICLE.meta}</p>
          <h3 id="article-title" className={ENTRY_TITLE}>
            {ARTICLE.title}
          </h3>
          <figure className="mt-6">
            <blockquote
              cite={ARTICLE.url}
              className={`${SANS} max-w-[36ch] border-l-2 border-[var(--color-nebula-coral)] pl-5 text-lg font-light italic leading-[1.4] text-[var(--color-silver)] md:text-[22px]`}
            >
              {ARTICLE.quote}
            </blockquote>
            <figcaption className={`${MONO_LABEL} mt-4`}>— {ARTICLE.attribution}</figcaption>
          </figure>
          <a
            href={ARTICLE.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Read the PyTorch blog post (opens in a new tab)"
            className={`${TEXT_LINK} mt-6 inline-block`}
          >
            Read the post ↗
          </a>
        </article>
      </div>

      <SlideViewer open={viewerOpen} onClose={() => setViewerOpen(false)} returnFocusRef={slidesButtonRef} />
    </section>
  );
}
