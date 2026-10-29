"use client";

/**
 * Resume. The PDF's page rendered as a sheet of paper floating in the night sky,
 * with download / open links beside it. The sheet itself also opens the PDF.
 */
import { useRef } from "react";
import Image from "next/image";
import { useStaggerReveal } from "@/hooks/useScrollReveal";
import { RESUME } from "@/content/resume";
import { MONO, SANS, TEXT_LINK } from "@/components/ui/classes";
import SectionHeading from "@/components/ui/SectionHeading";

const STAGGER_S = 0.1;

export default function ResumeSection(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  useStaggerReveal(sectionRef, STAGGER_S);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="resume-heading"
      className="px-4 py-16 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] md:items-center md:gap-[6vw] md:px-[8vw] md:py-[16vh]"
    >
      <div>
        <SectionHeading id="resume-heading" kicker="Resume" title="On paper" />
        <p
          data-reveal
          className={`${SANS} mt-6 max-w-[38ch] text-base leading-[1.55] text-[var(--color-text-body)] md:text-lg`}
        >
          {RESUME.line}
        </p>
        <div data-reveal className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <a
            href={RESUME.pdf}
            download={RESUME.downloadName}
            className={`${MONO} inline-flex items-center gap-3 rounded-full border border-[var(--color-nebula-teal)] px-5 py-3 text-[var(--color-silver)] transition-[background-color,transform] duration-150 hover:bg-[rgba(46,196,182,0.12)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-nebula-teal)] motion-reduce:transition-none`}
          >
            Download PDF <span aria-hidden="true">↓</span>
          </a>
          <a
            href={RESUME.pdf}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open the resume PDF (opens in a new tab)"
            className={TEXT_LINK}
          >
            Open in a new tab ↗
          </a>
        </div>
      </div>

      <a
        data-reveal
        href={RESUME.pdf}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View the full resume PDF (opens in a new tab)"
        className="group mt-12 block rounded-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[var(--color-nebula-teal)] md:mt-0"
      >
        <Image
          src={RESUME.page.src}
          alt={RESUME.page.alt}
          width={RESUME.page.width}
          height={RESUME.page.height}
          sizes="(min-width: 768px) 46vw, 100vw"
          loading="lazy"
          className="h-auto w-full rounded-[3px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9),0_0_60px_-10px_rgba(160,200,255,0.25)] transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:rotate-[-0.4deg] motion-reduce:transition-none"
        />
      </a>
    </section>
  );
}
